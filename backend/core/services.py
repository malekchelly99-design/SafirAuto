"""
Service layer — business logic sits here, not in views.
Depends on repositories via dependency injection.
"""

from .repositories import VehicleRepository, BrandRepository


class VehicleService:
    def __init__(self, repository: VehicleRepository):
        self.repo = repository

    def list_vehicles(self, filters=None, ordering=None, page=1, page_size=12):
        return self.repo.list(filters=filters, ordering=ordering, page=page, page_size=page_size)

    def list_admin_vehicles(self, filters=None, ordering=None, page=1, page_size=20):
        """Admin listing — includes all statuses."""
        admin_filters = dict(filters or {})
        if 'status' not in admin_filters:
            admin_filters['status'] = 'ALL'
        return self.repo.list(filters=admin_filters, ordering=ordering, page=page, page_size=page_size)

    def get_vehicle(self, vehicle_id: str):
        return self.repo.get(vehicle_id)

    def create_vehicle(self, data: dict):
        return self.repo.create(data)

    def update_vehicle(self, vehicle_id: str, data: dict):
        return self.repo.update(vehicle_id, data)

    def delete_vehicle(self, vehicle_id: str):
        return self.repo.delete(vehicle_id)

    def publish_vehicle(self, vehicle_id: str):
        return self.repo.update(vehicle_id, {'status': 'PUBLIÉ'})

    def unpublish_vehicle(self, vehicle_id: str):
        return self.repo.update(vehicle_id, {'status': 'BROUILLON'})

    def mark_sold(self, vehicle_id: str):
        return self.repo.update(vehicle_id, {'status': 'VENDU'})

    def mark_reserved(self, vehicle_id: str):
        return self.repo.update(vehicle_id, {'status': 'RÉSERVÉ'})

    def get_filter_options(self):
        return {
            'brands': self.repo.get_brands(),
        }

    def get_models_for_brand(self, brand: str):
        return self.repo.get_models_for_brand(brand)

    def get_stats(self):
        if hasattr(self.repo, 'get_stats'):
            return self.repo.get_stats()
        return {}


class BrandService:
    def __init__(self, repository: BrandRepository):
        self.repo = repository

    def list_brands(self):
        return self.repo.list()

    def get_brand(self, slug: str):
        return self.repo.get(slug)

    def create_brand(self, data: dict):
        return self.repo.create(data)

    def update_brand(self, slug: str, data: dict):
        return self.repo.update(slug, data)

    def delete_brand(self, slug: str):
        return self.repo.delete(slug)
