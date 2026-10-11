"""
Initialize Neon PostgreSQL database with admin user and migrations.
Run: python init_neon.py
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.core.management import call_command
from django.contrib.auth.models import User

print("Running migrations on Neon PostgreSQL...")
call_command('migrate', verbosity=1)
print("Migrations complete.")

if not User.objects.filter(username='malek').exists():
    User.objects.create_superuser(
        username='malek',
        email='malek@SafirAuto.fr',
        password='malek123456',
        first_name='Malek',
        last_name='VDL'
    )
    print("Admin user created: malek@SafirAuto.fr / malek123456!")
else:
    print("Admin user already exists.")

print("Done!")