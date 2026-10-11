"""
SpreadsheetVehicleRepository — implements VehicleRepository using openpyxl.
This is the initial storage layer. Replace with DjangoVehicleRepository later.
"""

import uuid
import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional

import openpyxl
from openpyxl import Workbook

from .repositories import VehicleRepository, BrandRepository

# Thread-safe lock for XLSX writes
_xlsx_lock = threading.Lock()


VEHICLE_COLUMNS = [
    'id', 'reference', 'status', 'brand', 'model', 'version', 'year', 'condition',
    'price', 'old_price', 'currency', 'mileage', 'fuel_type', 'transmission',
    'body_type', 'horsepower', 'engine_size', 'cylinders', 'doors', 'seats',
    'owners_count', 'first_registration', 'country_origin', 'exterior_color',
    'interior_color', 'upholstery', 'warranty', 'warranty_months', 'service_history',
    'accident_history', 'imported', 'title', 'short_description', 'description',
    'featured', 'badge', 'primary_image', 'images', 'equipment',
    'created_at', 'updated_at'
]

BRAND_COLUMNS = [
    'id', 'slug', 'name', 'logo', 'description', 'country', 'featured',
    'created_at', 'updated_at'
]


def _ensure_workbook(path: Path, columns: list) -> None:
    """Create XLSX if it doesn't exist."""
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        wb = Workbook()
        ws = wb.active
        ws.append(columns)
        wb.save(path)


def _row_to_dict(row_values: list, columns: list) -> dict:
    """Convert a row list to a dict using column headers."""
    d = {}
    for i, col in enumerate(columns):
        val = row_values[i] if i < len(row_values) else None
        # Deserialize JSON fields
        if col in ('images', 'equipment') and isinstance(val, str):
            try:
                val = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                val = []
        # Booleans stored as 1/0
        if col in ('featured', 'service_history', 'accident_history', 'imported',
                   'warranty') and val is not None:
            val = bool(val)
        d[col] = val
    return d


def _apply_filters(vehicles: list, filters: dict) -> list:
    """Filter vehicle list in-memory."""
    result = vehicles
    for key, value in (filters or {}).items():
        if value is None or value == '':
            continue
        if key == 'brand':
            result = [v for v in result if v.get('brand', '').lower() == str(value).lower()]
        elif key == 'model':
            result = [v for v in result if v.get('model', '').lower() == str(value).lower()]
        elif key == 'status':
            result = [v for v in result if v.get('status', '') == str(value)]
        elif key == 'condition':
            result = [v for v in result if v.get('condition', '') == str(value)]
        elif key == 'body_type':
            result = [v for v in result if v.get('body_type', '').lower() == str(value).lower()]
        elif key == 'fuel_type':
            result = [v for v in result if v.get('fuel_type', '').lower() == str(value).lower()]
        elif key == 'transmission':
            result = [v for v in result if v.get('transmission', '').lower() == str(value).lower()]
        elif key == 'min_price':
            result = [v for v in result if v.get('price') is not None and float(v['price']) >= float(value)]
        elif key == 'max_price':
            result = [v for v in result if v.get('price') is not None and float(v['price']) <= float(value)]
        elif key == 'min_year':
            result = [v for v in result if v.get('year') is not None and int(v['year']) >= int(value)]
        elif key == 'max_year':
            result = [v for v in result if v.get('year') is not None and int(v['year']) <= int(value)]
        elif key == 'min_mileage':
            result = [v for v in result if v.get('mileage') is not None and int(v['mileage']) >= int(value)]
        elif key == 'max_mileage':
            result = [v for v in result if v.get('mileage') is not None and int(v['mileage']) <= int(value)]
        elif key == 'min_horsepower':
            result = [v for v in result if v.get('horsepower') is not None and int(v['horsepower']) >= int(value)]
        elif key == 'max_horsepower':
            result = [v for v in result if v.get('horsepower') is not None and int(v['horsepower']) <= int(value)]
        elif key == 'owners_count':
            result = [v for v in result if v.get('owners_count') is not None and int(v['owners_count']) == int(value)]
        elif key == 'featured':
            result = [v for v in result if bool(v.get('featured')) == (str(value).lower() == 'true')]
        elif key == 'search':
            q = str(value).lower()
            result = [
                v for v in result
                if q in str(v.get('brand', '')).lower()
                or q in str(v.get('model', '')).lower()
                or q in str(v.get('version', '')).lower()
                or q in str(v.get('title', '')).lower()
            ]
        elif key == 'equipment':
            # Filter by equipment items (comma-separated)
            items = [e.strip().lower() for e in str(value).split(',')]
            def has_all_equipment(v):
                eq = v.get('equipment', [])
                if isinstance(eq, list):
                    eq_lower = [e.lower() for e in eq]
                else:
                    eq_lower = []
                return all(item in eq_lower for item in items)
            result = [v for v in result if has_all_equipment(v)]
    return result


def _apply_ordering(vehicles: list, ordering: str) -> list:
    """Sort vehicle list."""
    if not ordering:
        # Default: newest first
        return sorted(vehicles, key=lambda v: v.get('created_at') or '', reverse=True)
    reverse = ordering.startswith('-')
    field = ordering.lstrip('-')
    try:
        return sorted(vehicles, key=lambda v: (v.get(field) or 0), reverse=reverse)
    except Exception:
        return vehicles


class SpreadsheetVehicleRepository(VehicleRepository):
    """Concrete vehicle repository backed by an XLSX file."""

    def __init__(self, xlsx_path: Path):
        self.xlsx_path = xlsx_path
        _ensure_workbook(xlsx_path, VEHICLE_COLUMNS)

    def _load_all(self) -> list:
        with _xlsx_lock:
            wb = openpyxl.load_workbook(self.xlsx_path)
            ws = wb.active
            rows = list(ws.iter_rows(values_only=True))
        if len(rows) < 2:
            return []
        vehicles = []
        for row in rows[1:]:
            if row[0] is None:  # skip empty rows
                continue
            vehicles.append(_row_to_dict(list(row), VEHICLE_COLUMNS))
        return vehicles

    def _save_all(self, vehicles: list) -> None:
        with _xlsx_lock:
            wb = Workbook()
            ws = wb.active
            ws.append(VEHICLE_COLUMNS)
            for v in vehicles:
                row = []
                for col in VEHICLE_COLUMNS:
                    val = v.get(col)
                    if col in ('images', 'equipment') and isinstance(val, list):
                        val = json.dumps(val, ensure_ascii=False)
                    elif isinstance(val, bool):
                        val = int(val)
                    row.append(val)
                ws.append(row)
            wb.save(self.xlsx_path)

    def list(self, filters: dict = None, ordering: str = None, page: int = 1, page_size: int = 12) -> dict:
        all_vehicles = self._load_all()
        # For public API, only show PUBLIÉ by default unless admin explicitly requests other statuses
        if filters and 'status' not in filters:
            visible = [v for v in all_vehicles if v.get('status') == 'PUBLIÉ']
        elif filters and filters.get('status') == 'ALL':
            filters = {k: v for k, v in filters.items() if k != 'status'}
            visible = all_vehicles
        else:
            visible = all_vehicles

        filtered = _apply_filters(visible, filters)
        ordered = _apply_ordering(filtered, ordering)

        total = len(ordered)
        start = (page - 1) * page_size
        end = start + page_size
        page_items = ordered[start:end]

        return {
            'count': total,
            'total_pages': (total + page_size - 1) // page_size,
            'page': page,
            'page_size': page_size,
            'results': page_items,
        }

    def get(self, vehicle_id: str) -> Optional[dict]:
        vehicles = self._load_all()
        for v in vehicles:
            if str(v.get('id')) == str(vehicle_id):
                return v
        return None

    def create(self, data: dict) -> dict:
        vehicles = self._load_all()
        now = datetime.now().isoformat()
        data['id'] = str(uuid.uuid4())
        data.setdefault('reference', f'VDL-{str(uuid.uuid4())[:8].upper()}')
        data.setdefault('status', 'BROUILLON')
        data.setdefault('currency', 'EUR')
        data.setdefault('images', [])
        data.setdefault('equipment', [])
        data.setdefault('created_at', now)
        data['updated_at'] = now
        vehicles.append(data)
        self._save_all(vehicles)
        return data

    def update(self, vehicle_id: str, data: dict) -> dict:
        vehicles = self._load_all()
        now = datetime.now().isoformat()
        for i, v in enumerate(vehicles):
            if str(v.get('id')) == str(vehicle_id):
                vehicles[i] = {**v, **data, 'id': vehicle_id, 'updated_at': now}
                self._save_all(vehicles)
                return vehicles[i]
        raise ValueError(f'Vehicle {vehicle_id} not found')

    def delete(self, vehicle_id: str) -> bool:
        vehicles = self._load_all()
        new_vehicles = [v for v in vehicles if str(v.get('id')) != str(vehicle_id)]
        if len(new_vehicles) == len(vehicles):
            return False
        self._save_all(new_vehicles)
        return True

    def get_brands(self) -> list:
        vehicles = self._load_all()
        published = [v for v in vehicles if v.get('status') == 'PUBLIÉ']
        brands = sorted(set(v['brand'] for v in published if v.get('brand')))
        return brands

    def get_models_for_brand(self, brand: str) -> list:
        vehicles = self._load_all()
        published = [v for v in vehicles if v.get('status') == 'PUBLIÉ']
        models = sorted(set(
            v['model'] for v in published
            if v.get('brand', '').lower() == brand.lower() and v.get('model')
        ))
        return models

    def get_stats(self) -> dict:
        vehicles = self._load_all()
        return {
            'active': len([v for v in vehicles if v.get('status') == 'PUBLIÉ']),
            'sold': len([v for v in vehicles if v.get('status') == 'VENDU']),
            'draft': len([v for v in vehicles if v.get('status') == 'BROUILLON']),
            'reserved': len([v for v in vehicles if v.get('status') == 'RÉSERVÉ']),
            'total': len(vehicles),
        }


class SpreadsheetBrandRepository(BrandRepository):
    """Concrete brand repository backed by XLSX."""

    def __init__(self, xlsx_path: Path):
        self.xlsx_path = xlsx_path
        _ensure_workbook(xlsx_path, BRAND_COLUMNS)

    def _load_all(self) -> list:
        with _xlsx_lock:
            wb = openpyxl.load_workbook(self.xlsx_path)
            ws = wb.active
            rows = list(ws.iter_rows(values_only=True))
        if len(rows) < 2:
            return []
        brands = []
        for row in rows[1:]:
            if row[0] is None:
                continue
            d = _row_to_dict(list(row), BRAND_COLUMNS)
            brands.append(d)
        return brands

    def _save_all(self, brands: list) -> None:
        with _xlsx_lock:
            wb = Workbook()
            ws = wb.active
            ws.append(BRAND_COLUMNS)
            for b in brands:
                row = [b.get(col) for col in BRAND_COLUMNS]
                ws.append(row)
            wb.save(self.xlsx_path)

    def list(self) -> list:
        return self._load_all()

    def get(self, slug: str) -> Optional[dict]:
        brands = self._load_all()
        for b in brands:
            if b.get('slug') == slug:
                return b
        return None

    def create(self, data: dict) -> dict:
        brands = self._load_all()
        now = datetime.now().isoformat()
        data.setdefault('id', str(uuid.uuid4()))
        data['created_at'] = now
        data['updated_at'] = now
        brands.append(data)
        self._save_all(brands)
        return data

    def update(self, slug: str, data: dict) -> dict:
        brands = self._load_all()
        now = datetime.now().isoformat()
        for i, b in enumerate(brands):
            if b.get('slug') == slug:
                brands[i] = {**b, **data, 'updated_at': now}
                self._save_all(brands)
                return brands[i]
        raise ValueError(f'Brand {slug} not found')

    def delete(self, slug: str) -> bool:
        brands = self._load_all()
        new_brands = [b for b in brands if b.get('slug') != slug]
        if len(new_brands) == len(brands):
            return False
        self._save_all(new_brands)
        return True
