import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.container import get_vehicle_service, get_brand_service

vs = get_vehicle_service()
bs = get_brand_service()

result = vs.list_vehicles(page_size=3)
print(f"Vehicles total: {result['count']}")
print(f"First vehicle: {result['results'][0]['brand']} {result['results'][0]['model']}")

brands = bs.list_brands()
print(f"Brands: {len(brands)}")

stats = vs.get_stats()
print(f"Stats: {stats}")
print("OK - All data layers working!")
