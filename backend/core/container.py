"""
Simple service locator / dependency container.
Replace SpreadsheetVehicleRepository with DjangoVehicleRepository here
when migrating to PostgreSQL — no other file changes needed.
"""

from django.conf import settings
from .spreadsheet_repository import SpreadsheetVehicleRepository, SpreadsheetBrandRepository
from .services import VehicleService, BrandService

_vehicle_service = None
_brand_service = None


def get_vehicle_service() -> VehicleService:
    global _vehicle_service
    if _vehicle_service is None:
        repo = SpreadsheetVehicleRepository(settings.VEHICLES_XLSX_PATH)
        _vehicle_service = VehicleService(repo)
    return _vehicle_service


def get_brand_service() -> BrandService:
    global _brand_service
    if _brand_service is None:
        repo = SpreadsheetBrandRepository(settings.BRANDS_XLSX_PATH)
        _brand_service = BrandService(repo)
    return _brand_service
