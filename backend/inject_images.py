"""
Inject real Unsplash car image URLs into existing vehicles in the XLSX.
Run: python inject_images.py
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django; django.setup()
from django.conf import settings
import openpyxl

# Map brand -> list of Unsplash image URLs (multiple per vehicle for gallery)
BRAND_IMAGES = {
    'Porsche': [
        [
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Ferrari': [
        [
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Lamborghini': [
        [
            'https://images.unsplash.com/photo-1621993202067-5a5e7c9d7c5d?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621993202067-5a5e7c9d7c5d?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Mercedes-Benz': [
        [
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'BMW': [
        [
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Bentley': [
        [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Aston Martin': [
        [
            'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'McLaren': [
        [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1579605970044-42a86b8e6b87?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621993202067-5a5e7c9d7c5d?w=1200&q=85&auto=format&fit=crop',
        ],
        [
            'https://images.unsplash.com/photo-1579605970044-42a86b8e6b87?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Range Rover': [
        [
            'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Maserati': [
        [
            'https://images.unsplash.com/photo-1590510696685-b8f8a86a0a1d?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590510696685-b8f8a86a0a1d?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
    'Audi': [
        [
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=85&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&q=85&auto=format&fit=crop',
        ],
    ],
}

# Fallback for unknown brands
FALLBACK = [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=85&auto=format&fit=crop',
]

path = settings.VEHICLES_XLSX_PATH
wb = openpyxl.load_workbook(path)
ws = wb.active

# Get headers
headers = [cell.value for cell in ws[1]]
brand_col = headers.index('brand')
images_col = headers.index('images')
primary_col = headers.index('primary_image')

brand_counters = {}

for row in ws.iter_rows(min_row=2):
    brand = row[brand_col].value
    if not brand:
        continue

    count = brand_counters.get(brand, 0)
    brand_counters[brand] = count + 1

    brand_imgs = BRAND_IMAGES.get(brand, [FALLBACK])
    imgs = brand_imgs[count % len(brand_imgs)]

    row[images_col].value = json.dumps(imgs)
    row[primary_col].value = imgs[0]

wb.save(path)
print(f"✅ Images injected into {path}")

# Verify
wb2 = openpyxl.load_workbook(path)
ws2 = wb2.active
count = 0
for row in ws2.iter_rows(min_row=2, values_only=True):
    if row[primary_col] and row[primary_col] != '':
        count += 1
print(f"✅ {count} vehicles now have images")
