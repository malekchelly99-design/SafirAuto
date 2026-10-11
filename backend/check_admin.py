"""
Check admin user in Neon database.
Run: python check_admin.py
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth.models import User

users = User.objects.all()
print(f"Total users: {users.count()}")
for u in users:
    print(f"  - {u.username} | {u.email} | staff={u.is_staff} | superuser={u.is_superuser}")

# Try to find by email
try:
    user = User.objects.get(email='malek@SafirAuto.fr')
    print(f"\nFound by email: {user.username} | password check: {user.check_password('malek123456')}")
except User.DoesNotExist:
    print("\nUser not found by email malek@SafirAuto.fr")

# Try to find by username
try:
    user = User.objects.get(username='malek')
    print(f"Found by username: {user.email} | password check: {user.check_password('malek123456')}")
except User.DoesNotExist:
    print("User not found by username malek")