"""
Abstract repository interfaces — storage-agnostic.
These can be implemented by SpreadsheetVehicleRepository today
and replaced with DjangoVehicleRepository (ORM) without any frontend changes.
"""

from abc import ABC, abstractmethod
from typing import Optional


class VehicleRepository(ABC):
    """Abstract interface for vehicle data access."""

    @abstractmethod
    def list(self, filters: dict = None, ordering: str = None, page: int = 1, page_size: int = 12) -> dict:
        """Return paginated, filtered vehicle list."""
        pass

    @abstractmethod
    def get(self, vehicle_id: str) -> Optional[dict]:
        """Return single vehicle by id."""
        pass

    @abstractmethod
    def create(self, data: dict) -> dict:
        """Create and persist a new vehicle."""
        pass

    @abstractmethod
    def update(self, vehicle_id: str, data: dict) -> dict:
        """Update an existing vehicle."""
        pass

    @abstractmethod
    def delete(self, vehicle_id: str) -> bool:
        """Delete a vehicle."""
        pass

    @abstractmethod
    def get_brands(self) -> list:
        """Return distinct brands available in the catalogue."""
        pass

    @abstractmethod
    def get_models_for_brand(self, brand: str) -> list:
        """Return distinct models for a given brand."""
        pass


class BrandRepository(ABC):
    """Abstract interface for brand data access."""

    @abstractmethod
    def list(self) -> list:
        pass

    @abstractmethod
    def get(self, slug: str) -> Optional[dict]:
        pass

    @abstractmethod
    def create(self, data: dict) -> dict:
        pass

    @abstractmethod
    def update(self, slug: str, data: dict) -> dict:
        pass

    @abstractmethod
    def delete(self, slug: str) -> bool:
        pass
