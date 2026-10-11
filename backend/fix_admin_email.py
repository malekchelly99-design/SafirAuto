"""
Fix admin email to malek@SafirAuto.fr
Run: python fix_admin_email.py
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth.models import User

try:
    user = User.objects.get(username='malek')
    user.email = 'malek@SafirAuto.fr'
    user.save()
    print(f"Email updated to: {user.email}")
except User.DoesNotExist:
    print("User malek not found")