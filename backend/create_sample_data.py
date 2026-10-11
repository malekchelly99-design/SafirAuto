"""
Script to seed the XLSX files with sample vehicles and brands.
Run: python create_sample_data.py
"""

import sys
import os
import json
import uuid
from datetime import datetime

# Add parent path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from core.spreadsheet_repository import (
    SpreadsheetVehicleRepository, SpreadsheetBrandRepository,
    VEHICLE_COLUMNS, BRAND_COLUMNS
)
import openpyxl
from openpyxl import Workbook

VEHICLES_PATH = settings.VEHICLES_XLSX_PATH
BRANDS_PATH = settings.BRANDS_XLSX_PATH

BRANDS_PATH.parent.mkdir(parents=True, exist_ok=True)
VEHICLES_PATH.parent.mkdir(parents=True, exist_ok=True)

# ─── BRANDS ─────────────────────────────────────────────────────────────────

brands_data = [
    {'slug': 'porsche', 'name': 'Porsche', 'country': 'Allemagne', 'featured': True, 'description': "Porsche est synonyme d'excellence sportive et de luxe automobile depuis 1931."},
    {'slug': 'ferrari', 'name': 'Ferrari', 'country': 'Italie', 'featured': True, 'description': "Ferrari incarne la passion italienne pour la vitesse et le style depuis 1939."},
    {'slug': 'lamborghini', 'name': 'Lamborghini', 'country': 'Italie', 'featured': True, 'description': "Lamborghini définit l'hypercar depuis 1963."},
    {'slug': 'mercedes-benz', 'name': 'Mercedes-Benz', 'country': 'Allemagne', 'featured': True, 'description': "Mercedes-Benz est le symbole du luxe automobile allemand."},
    {'slug': 'bmw', 'name': 'BMW', 'country': 'Allemagne', 'featured': True, 'description': "BMW — Le Plaisir de Conduire."},
    {'slug': 'audi', 'name': 'Audi', 'country': 'Allemagne', 'featured': False, 'description': "Audi — Avance par la technologie."},
    {'slug': 'bentley', 'name': 'Bentley', 'country': 'Royaume-Uni', 'featured': True, 'description': "Bentley représente le summum du luxe britannique."},
    {'slug': 'aston-martin', 'name': 'Aston Martin', 'country': 'Royaume-Uni', 'featured': True, 'description': "Aston Martin — Power, Beauty, Soul."},
    {'slug': 'mclaren', 'name': 'McLaren', 'country': 'Royaume-Uni', 'featured': True, 'description': "McLaren est la référence en matière de supercars technologiques."},
    {'slug': 'range-rover', 'name': 'Range Rover', 'country': 'Royaume-Uni', 'featured': True, 'description': "Range Rover combine luxe et capacités tout-terrain."},
    {'slug': 'maserati', 'name': 'Maserati', 'country': 'Italie', 'featured': False, 'description': "Maserati — Le luxe sportif à l'italienne."},
]

# Write brands
wb = Workbook()
ws = wb.active
ws.append(BRAND_COLUMNS)
now = datetime.now().isoformat()
for b in brands_data:
    row = [
        str(uuid.uuid4()),  # id
        b['slug'],
        b['name'],
        '',  # logo
        b.get('description', ''),
        b.get('country', ''),
        int(b.get('featured', False)),
        now,
        now,
    ]
    ws.append(row)
wb.save(BRANDS_PATH)
print(f"✓ Brands saved to {BRANDS_PATH}")

# ─── VEHICLES ────────────────────────────────────────────────────────────────

vehicles_data = [
    {
        'brand': 'Porsche', 'model': '911 Carrera 4 GTS', 'version': 'Cabriolet PDK',
        'year': 2024, 'condition': 'Occasion', 'price': 179900, 'old_price': 195000,
        'mileage': 6800, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Cabriolet', 'horsepower': 480, 'engine_size': 3.0,
        'cylinders': 6, 'doors': 2, 'seats': 2, 'owners_count': 1,
        'exterior_color': 'Noir Jet', 'interior_color': 'Rouge Craie',
        'upholstery': 'Cuir pleine fleur', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Porsche 911 Carrera 4 GTS Cabriolet — Exemplaire d\'exception',
        'short_description': 'Porsche 911 GTS Cabriolet en parfait état, faible kilométrage.',
        'description': 'Magnifique Porsche 911 Carrera 4 GTS Cabriolet en finition haut de gamme. Cet exemplaire bénéficie d\'un entretien complet chez le concessionnaire officiel Porsche. Équipée du pack Sport Chrono, des jantes Carrera Classic 20" et du système audio Bose.',
        'featured': True, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit ouvrant', 'Sièges chauffants', 'Apple CarPlay', 'Caméra 360°', 'Régulateur adaptatif', 'Head-up display', 'Bose', 'Sport Chrono']
    },
    {
        'brand': 'Ferrari', 'model': 'Roma', 'version': 'Spider',
        'year': 2023, 'condition': 'Occasion', 'price': 298000, 'old_price': None,
        'mileage': 3200, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Cabriolet', 'horsepower': 620, 'engine_size': 3.9,
        'cylinders': 8, 'doors': 2, 'seats': 2, 'owners_count': 1,
        'exterior_color': 'Rosso Corsa', 'interior_color': 'Beige Cuoio',
        'upholstery': 'Cuir Frau', 'country_origin': 'Italie',
        'warranty': True, 'warranty_months': 24, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Ferrari Roma Spider — La dolce vita sur quatre roues',
        'short_description': 'Ferrari Roma Spider, exemplaire exceptionnel avec faible kilométrage.',
        'description': 'Splendide Ferrari Roma Spider en Rosso Corsa sur intérieur Beige Cuoio. Cet exemplaire unique combine la légèreté du cabriolet avec la puissance iconique de Ferrari. Livré avec tous ses documents d\'origine et son passeport Ferrari.',
        'featured': True, 'badge': 'COUP DE CŒUR', 'status': 'PUBLIÉ',
        'equipment': ['Sièges chauffants', 'Apple CarPlay', 'Caméra de recul', 'Régulateur adaptatif', 'Head-up display', 'Système audio Ferrari Premium', 'Suspension magnétique', 'Freins carbone-céramique']
    },
    {
        'brand': 'Lamborghini', 'model': 'Urus', 'version': 'S',
        'year': 2023, 'condition': 'Occasion', 'price': 349000, 'old_price': 380000,
        'mileage': 8500, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 666, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 5, 'owners_count': 1,
        'exterior_color': 'Bianco Monocerus', 'interior_color': 'Noir Alcantara',
        'upholstery': 'Alcantara/Cuir', 'country_origin': 'Italie',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Lamborghini Urus S — Le SUV le plus puissant du monde',
        'short_description': 'Lamborghini Urus S, la supercar des SUV.',
        'description': 'Impressionnant Lamborghini Urus S en Bianco Monocerus sur intérieur Noir Alcantara. Puissant V8 biturbo de 666 chevaux, tous les packs Lamborghini d\'usine. Véhicule certifié Lamborghini.',
        'featured': True, 'badge': 'NOUVEAUTÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Sièges massants', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Bang & Olufsen', '4 roues motrices', 'Suspension adaptative', 'Différentiel sport']
    },
    {
        'brand': 'Mercedes-Benz', 'model': 'G 63 AMG', 'version': 'Edition 55',
        'year': 2023, 'condition': 'Occasion', 'price': 249000, 'old_price': None,
        'mileage': 12000, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 585, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 5, 'owners_count': 1,
        'exterior_color': 'Obsidian Black', 'interior_color': 'Nappa Noir',
        'upholstery': 'Cuir Nappa AMG', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Mercedes G 63 AMG Edition 55 — Légende intemporelle',
        'short_description': 'Le Mercedes G 63 AMG, le SUV légendaire en version AMG.',
        'description': 'Mythique Mercedes-Benz G 63 AMG Edition 55, édition spéciale anniversaire. Ce monstre de 585 chevaux allie la robustesse légendaire du G-Wagen à la performance AMG. Intérieur AMG Performance en cuir Nappa noir, pack Night Package, toit panoramique.',
        'featured': True, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Burmester', '4 roues motrices', 'Différentiel sport', 'Échappement sport']
    },
    {
        'brand': 'BMW', 'model': 'M4 Competition', 'version': 'xDrive Cabriolet',
        'year': 2024, 'condition': 'Neuf', 'price': 139900, 'old_price': None,
        'mileage': 150, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Cabriolet', 'horsepower': 530, 'engine_size': 3.0,
        'cylinders': 6, 'doors': 2, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Brooklyn Grey', 'interior_color': 'Bleu Merino',
        'upholstery': 'Cuir Merino', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 24, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'BMW M4 Competition xDrive Cabriolet — Nouvelle génération',
        'short_description': 'BMW M4 Competition xDrive Cabriolet, neuve, prête à livrer.',
        'description': 'BMW M4 Competition xDrive Cabriolet à seulement 150 km. Livrée avec tous les packs M : M Carbon Package, M Driver\'s Package, Harman Kardon, pack Innovation.',
        'featured': False, 'badge': 'NOUVEAUTÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit ouvrant', 'Sièges chauffants', 'Sièges ventilés', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Harman Kardon', '4 roues motrices', 'Suspension adaptative', 'Head-up display', 'Freins carbone-céramique']
    },
    {
        'brand': 'Bentley', 'model': 'Bentayga', 'version': 'EWB Azure',
        'year': 2024, 'condition': 'Neuf', 'price': 389000, 'old_price': None,
        'mileage': 500, 'fuel_type': 'Hybride', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 462, 'engine_size': 3.0,
        'cylinders': 6, 'doors': 4, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Onyx Black', 'interior_color': 'Magnolia',
        'upholstery': 'Cuir Diamond Stitch', 'country_origin': 'Royaume-Uni',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Bentley Bentayga EWB Azure — L\'ultime expression du luxe',
        'short_description': 'Bentley Bentayga EWB Azure, empattement allongé, luxe absolu.',
        'description': 'Bentley Bentayga Extended Wheelbase Azure — l\'expression ultime du luxe automobile. Empattement allongé pour un espace arrière royal, motorisation hybride rechargeable, Naim for Bentley audio system.',
        'featured': True, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Sièges massants', 'Apple CarPlay', 'Caméra 360°', 'Naim Audio', '4 roues motrices', 'Suspension adaptative', 'Head-up display', 'Recharge sans fil']
    },
    {
        'brand': 'Aston Martin', 'model': 'DBX', 'version': '707',
        'year': 2023, 'condition': 'Occasion', 'price': 259000, 'old_price': 289000,
        'mileage': 9800, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 707, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 5, 'owners_count': 1,
        'exterior_color': 'Xenon Grey', 'interior_color': 'Caramel',
        'upholstery': 'Cuir Windsor', 'country_origin': 'Royaume-Uni',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Aston Martin DBX 707 — Le SUV le plus puissant d\'Aston Martin',
        'short_description': 'Aston Martin DBX 707, SUV sportif de luxe avec 707 ch.',
        'description': 'Impressionnant Aston Martin DBX 707, le SUV le plus puissant jamais créé par Aston Martin. 707 chevaux issus d\'un V8 biturbo AMG, châssis sport AMR, freins carbone-céramique.',
        'featured': True, 'badge': 'COUP DE CŒUR', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Apple CarPlay', 'Caméra 360°', '4 roues motrices', 'Suspension adaptative', 'Freins carbone-céramique', 'Différentiel sport']
    },
    {
        'brand': 'McLaren', 'model': '720S', 'version': 'Spider Performance',
        'year': 2022, 'condition': 'Occasion', 'price': 299000, 'old_price': 329000,
        'mileage': 5600, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Cabriolet', 'horsepower': 720, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 2, 'seats': 2, 'owners_count': 1,
        'exterior_color': 'Papaya Spark', 'interior_color': 'Noir/Orange',
        'upholstery': 'Cuir Alcantara', 'country_origin': 'Royaume-Uni',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'McLaren 720S Spider Performance — Supercar d\'exception',
        'short_description': 'McLaren 720S Spider en Papaya Spark, 720 ch de pur plaisir.',
        'description': 'Sublime McLaren 720S Spider Performance en Papaya Spark sur intérieur Noir/Orange. Cette machine de 720 chevaux offre des performances de supercar avec la liberté du ciel ouvert. Pack Track Telemetry, système audio Bowers & Wilkins.',
        'featured': True, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Sièges chauffants', 'Apple CarPlay', 'Caméra de recul', 'Bowers & Wilkins', 'Suspension adaptative', 'Freins carbone-céramique', 'Différentiel sport', 'Échappement sport']
    },
    {
        'brand': 'Range Rover', 'model': 'Range Rover', 'version': 'SV Autobiography LWB',
        'year': 2024, 'condition': 'Neuf', 'price': 299000, 'old_price': None,
        'mileage': 200, 'fuel_type': 'Hybride', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 530, 'engine_size': 4.4,
        'cylinders': 8, 'doors': 4, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Carpathian Grey', 'interior_color': 'Almond',
        'upholstery': 'Cuir Windsor', 'country_origin': 'Royaume-Uni',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Range Rover SV Autobiography LWB — Royauté automobile',
        'short_description': 'Le Range Rover SV dans sa configuration la plus exclusive.',
        'description': 'Range Rover SV Autobiography Long Wheelbase — la définition du luxe britannique. Empattement allongé, finition SV exclusive, système audio Meridian Signature, réfrigérateur intégré.',
        'featured': True, 'badge': 'NOUVEAUTÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Sièges massants', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Meridian Audio', '4 roues motrices', 'Suspension adaptative', 'Head-up display', 'Recharge sans fil']
    },
    {
        'brand': 'Maserati', 'model': 'MC20', 'version': 'Cielo',
        'year': 2023, 'condition': 'Occasion', 'price': 329000, 'old_price': None,
        'mileage': 2100, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Cabriolet', 'horsepower': 630, 'engine_size': 3.0,
        'cylinders': 6, 'doors': 2, 'seats': 2, 'owners_count': 1,
        'exterior_color': 'Bianco Audace', 'interior_color': 'Rouge Corsa',
        'upholstery': 'Cuir/Alcantara', 'country_origin': 'Italie',
        'warranty': True, 'warranty_months': 24, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Maserati MC20 Cielo — Le supercar italien à ciel ouvert',
        'short_description': 'Maserati MC20 Cielo, supercar cabriolet de 630 ch.',
        'description': 'Exceptionnel Maserati MC20 Cielo en Bianco Audace avec intérieur Rouge Corsa. Le premier supercar Maserati depuis une décennie, propulsé par le moteur Nettuno à technologie F1.',
        'featured': True, 'badge': 'COUP DE CŒUR', 'status': 'PUBLIÉ',
        'equipment': ['Toit ouvrant', 'Sièges chauffants', 'Apple CarPlay', 'Caméra de recul', 'Suspension adaptative', 'Freins carbone-céramique', 'Différentiel sport', 'Échappement sport']
    },
    {
        'brand': 'Porsche', 'model': 'Cayenne', 'version': 'Turbo GT',
        'year': 2023, 'condition': 'Occasion', 'price': 219000, 'old_price': 245000,
        'mileage': 14500, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 640, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 5, 'owners_count': 1,
        'exterior_color': 'Jet Black Metallic', 'interior_color': 'Noir Alcantara',
        'upholstery': 'Alcantara Race-Tex', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Porsche Cayenne Turbo GT — Le SUV le plus rapide du Nürburgring',
        'short_description': 'Porsche Cayenne Turbo GT, 640 ch, le SUV ultime.',
        'description': 'Le Porsche Cayenne Turbo GT détient le record du Nürburgring. 640 chevaux, boîte PDK 8 rapports, différentiel sport, freins céramique PCCB, jantes 22".',
        'featured': False, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Apple CarPlay', 'Caméra 360°', 'Bose', '4 roues motrices', 'Suspension adaptative', 'Freins carbone-céramique', 'Différentiel sport', 'Sport Chrono']
    },
    {
        'brand': 'Mercedes-Benz', 'model': 'AMG GT', 'version': '63 S E Performance',
        'year': 2024, 'condition': 'Neuf', 'price': 269000, 'old_price': None,
        'mileage': 0, 'fuel_type': 'Hybride', 'transmission': 'Automatique',
        'body_type': 'Berline', 'horsepower': 843, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Gris Graphite', 'interior_color': 'Nappa Noir',
        'upholstery': 'Cuir AMG Nappa', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Mercedes-AMG GT 63 S E Performance — Hybride de 843 ch',
        'short_description': 'Mercedes-AMG GT 63 S E Performance, la berline sportive hybride ultime.',
        'description': 'Mercedes-AMG GT 63 S E Performance, la berline 4 portes la plus puissante au monde avec 843 chevaux issus de la technologie F1 hybride.',
        'featured': True, 'badge': 'NOUVEAUTÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Sièges massants', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Burmester', '4 roues motrices', 'Head-up display', 'Suspension adaptative', 'Freins carbone-céramique']
    },
    {
        'brand': 'Ferrari', 'model': 'Purosangue', 'version': 'V12',
        'year': 2024, 'condition': 'Neuf', 'price': 459000, 'old_price': None,
        'mileage': 100, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 725, 'engine_size': 6.5,
        'cylinders': 12, 'doors': 4, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Rosso Fuoco', 'interior_color': 'Beige Cuoio',
        'upholstery': 'Cuir Poltrona Frau', 'country_origin': 'Italie',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Ferrari Purosangue — Le premier Ferrari SUV V12',
        'short_description': 'Ferrari Purosangue, le SUV Ferrari avec moteur V12 naturellement aspiré.',
        'description': 'Ferrari Purosangue — une révolution signée Ferrari. Premier Ferrari à 4 portes jamais créé, propulsé par un V12 naturellement aspiré de 725 chevaux à 8 250 tr/min.',
        'featured': True, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Sièges massants', 'Apple CarPlay', 'Caméra 360°', 'Système audio Ferrari', '4 roues motrices', 'Suspension magnétique', 'Head-up display', 'Freins carbone-céramique']
    },
    {
        'brand': 'BMW', 'model': 'M8', 'version': 'Competition Gran Coupé',
        'year': 2023, 'condition': 'Occasion', 'price': 159000, 'old_price': 179000,
        'mileage': 18000, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Coupé', 'horsepower': 625, 'engine_size': 4.4,
        'cylinders': 8, 'doors': 4, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Carbon Black', 'interior_color': 'Merino Rouge',
        'upholstery': 'Cuir Merino', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'BMW M8 Competition Gran Coupé — Le grand tourer sportif',
        'short_description': 'BMW M8 Competition Gran Coupé, élégance et performance.',
        'description': 'BMW M8 Competition Gran Coupé en Carbon Black sur Merino Rouge. 625 chevaux, transmission M xDrive, packs M Carbon et M Driver\'s Package.',
        'featured': False, 'badge': 'PROMOTION', 'status': 'PUBLIÉ',
        'equipment': ['Toit ouvrant', 'Sièges chauffants', 'Sièges ventilés', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Harman Kardon', '4 roues motrices', 'Head-up display', 'Suspension adaptative', 'Freins carbone-céramique']
    },
    {
        'brand': 'Audi', 'model': 'RS Q8', 'version': 'Performance',
        'year': 2024, 'condition': 'Neuf', 'price': 179000, 'old_price': None,
        'mileage': 0, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'SUV', 'horsepower': 640, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 5, 'owners_count': 1,
        'exterior_color': 'Nardo Grey', 'interior_color': 'Noir Valcona',
        'upholstery': 'Cuir Valcona', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Audi RS Q8 Performance — Le SUV de performance ultime',
        'short_description': 'Audi RS Q8 Performance, 640 ch, nouvelle version encore plus puissante.',
        'description': 'Audi RS Q8 Performance en Nardo Grey sur intérieur Noir Valcona. Version restylée et dopée à 640 chevaux, châssis RS avec amortissement adaptatif.',
        'featured': False, 'badge': 'NOUVEAUTÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Bang & Olufsen', '4 roues motrices', 'Suspension adaptative', 'Head-up display']
    },
    {
        'brand': 'Porsche', 'model': 'Panamera', 'version': 'Turbo S E-Hybrid Sport Turismo',
        'year': 2024, 'condition': 'Neuf', 'price': 249000, 'old_price': None,
        'mileage': 0, 'fuel_type': 'Hybride', 'transmission': 'Automatique',
        'body_type': 'Break', 'horsepower': 700, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 5, 'owners_count': 1,
        'exterior_color': 'Craie', 'interior_color': 'Cognac',
        'upholstery': 'Cuir pleine fleur', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Porsche Panamera Turbo S E-Hybrid Sport Turismo — La berline sportive hybride',
        'short_description': 'Porsche Panamera Turbo S E-Hybrid Sport Turismo, 700 ch hybride.',
        'description': 'Porsche Panamera Turbo S E-Hybrid Sport Turismo, la combinaison parfaite entre luxe, performance et efficience. 700 chevaux, autonomie électrique de 50 km.',
        'featured': False, 'badge': 'NOUVEAUTÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Sièges massants', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Burmester', '4 roues motrices', 'Suspension adaptative', 'Head-up display', 'Sport Chrono', 'Recharge sans fil']
    },
    {
        'brand': 'Mercedes-Benz', 'model': 'Classe S', 'version': 'S 580 Maybach 4MATIC',
        'year': 2024, 'condition': 'Neuf', 'price': 299000, 'old_price': None,
        'mileage': 0, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Berline', 'horsepower': 503, 'engine_size': 4.0,
        'cylinders': 8, 'doors': 4, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Rubellite Red/Obsidian Black', 'interior_color': 'Porcelaine',
        'upholstery': 'Cuir Nappa Maybach', 'country_origin': 'Allemagne',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Mercedes-Maybach Classe S 580 — L\'ultra-luxe automobile',
        'short_description': 'Mercedes-Maybach S 580, la limousine la plus luxueuse.',
        'description': 'Mercedes-Maybach Classe S 580 4MATIC, la quintessence du luxe automobile. Empattement allongé, sièges exécutifs massants chauffants ventilés, Burmester 4D Surround Sound.',
        'featured': True, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Toit panoramique', 'Sièges chauffants', 'Sièges ventilés', 'Sièges massants', 'Apple CarPlay', 'Android Auto', 'Caméra 360°', 'Burmester', '4 roues motrices', 'Suspension adaptative', 'Head-up display', 'Recharge sans fil', 'Réfrigérateur']
    },
    {
        'brand': 'Bentley', 'model': 'Continental GT', 'version': 'Speed',
        'year': 2023, 'condition': 'Occasion', 'price': 289000, 'old_price': 319000,
        'mileage': 4200, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Coupé', 'horsepower': 659, 'engine_size': 6.0,
        'cylinders': 12, 'doors': 2, 'seats': 4, 'owners_count': 1,
        'exterior_color': 'Beluga Black', 'interior_color': 'Linen',
        'upholstery': 'Cuir Diamond Stitch', 'country_origin': 'Royaume-Uni',
        'warranty': True, 'warranty_months': 12, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Bentley Continental GT Speed — Le grand tourisme ultime',
        'short_description': 'Bentley Continental GT Speed W12, le grand tourisme par excellence.',
        'description': 'Bentley Continental GT Speed en Beluga Black sur intérieur Linen. Motorisation W12 de 659 chevaux, châssis Speed, Electronic All-Wheel Steering, freins carbone-céramique.',
        'featured': True, 'badge': 'COUP DE CŒUR', 'status': 'PUBLIÉ',
        'equipment': ['Sièges chauffants', 'Sièges ventilés', 'Apple CarPlay', 'Caméra 360°', 'Naim Audio', '4 roues motrices', 'Suspension adaptative', 'Freins carbone-céramique', 'Head-up display', 'Recharge sans fil']
    },
    {
        'brand': 'McLaren', 'model': 'Artura', 'version': 'Spider',
        'year': 2024, 'condition': 'Neuf', 'price': 289000, 'old_price': None,
        'mileage': 0, 'fuel_type': 'Hybride', 'transmission': 'Automatique',
        'body_type': 'Cabriolet', 'horsepower': 700, 'engine_size': 3.0,
        'cylinders': 6, 'doors': 2, 'seats': 2, 'owners_count': 1,
        'exterior_color': 'Volcano Orange', 'interior_color': 'Noir Carbon',
        'upholstery': 'Alcantara/Cuir', 'country_origin': 'Royaume-Uni',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'McLaren Artura Spider — La supercar hybride à ciel ouvert',
        'short_description': 'McLaren Artura Spider, hybride de 700 ch, toute nouvelle.',
        'description': 'McLaren Artura Spider — la première supercar hybride haute performance de McLaren en version cabriolet. Architecture tout-carbone, 700 chevaux, moins de 1 500 kg.',
        'featured': True, 'badge': 'NOUVEAUTÉ', 'status': 'PUBLIÉ',
        'equipment': ['Sièges chauffants', 'Apple CarPlay', 'Caméra de recul', 'Bowers & Wilkins', 'Suspension adaptative', 'Freins carbone-céramique', 'Différentiel sport', 'Échappement sport']
    },
    {
        'brand': 'Lamborghini', 'model': 'Huracán', 'version': 'Sterrato',
        'year': 2024, 'condition': 'Neuf', 'price': 329000, 'old_price': None,
        'mileage': 50, 'fuel_type': 'Essence', 'transmission': 'Automatique',
        'body_type': 'Coupé', 'horsepower': 610, 'engine_size': 5.2,
        'cylinders': 10, 'doors': 2, 'seats': 2, 'owners_count': 1,
        'exterior_color': 'Verde Citrea', 'interior_color': 'Noir Alcantara',
        'upholstery': 'Alcantara', 'country_origin': 'Italie',
        'warranty': True, 'warranty_months': 36, 'service_history': True,
        'accident_history': False, 'imported': False,
        'title': 'Lamborghini Huracán Sterrato — La supercar tout-terrain',
        'short_description': 'Lamborghini Huracán Sterrato, unique supercar tout-terrain.',
        'description': 'Lamborghini Huracán Sterrato — l\'unique supercar capable d\'aller hors des sentiers battus. Garde au sol surélevée, protection carrosserie, V10 naturellement aspiré de 610 chevaux.',
        'featured': True, 'badge': 'EXCLUSIVITÉ', 'status': 'PUBLIÉ',
        'equipment': ['Sièges chauffants', 'Apple CarPlay', 'Caméra de recul', '4 roues motrices', 'Suspension adaptative', 'Différentiel sport', 'Échappement sport']
    },
]

# Write vehicles
wb = Workbook()
ws = wb.active
ws.append(VEHICLE_COLUMNS)
now = datetime.now().isoformat()
for v in vehicles_data:
    row = [
        str(uuid.uuid4()),  # id
        f'VDL-{str(uuid.uuid4())[:8].upper()}',  # reference
        v.get('status', 'PUBLIÉ'),
        v['brand'],
        v['model'],
        v.get('version', ''),
        v['year'],
        v['condition'],
        v['price'],
        v.get('old_price'),
        'EUR',
        v['mileage'],
        v['fuel_type'],
        v['transmission'],
        v['body_type'],
        v.get('horsepower'),
        v.get('engine_size'),
        v.get('cylinders'),
        v.get('doors'),
        v.get('seats'),
        v.get('owners_count'),
        v.get('first_registration', f"01/{v['year']}"),
        v.get('country_origin', ''),
        v.get('exterior_color', ''),
        v.get('interior_color', ''),
        v.get('upholstery', ''),
        int(v.get('warranty', True)),
        v.get('warranty_months', 12),
        int(v.get('service_history', True)),
        int(v.get('accident_history', False)),
        int(v.get('imported', False)),
        v.get('title', ''),
        v.get('short_description', ''),
        v.get('description', ''),
        int(v.get('featured', False)),
        v.get('badge', ''),
        '',  # primary_image
        json.dumps([], ensure_ascii=False),  # images
        json.dumps(v.get('equipment', []), ensure_ascii=False),
        now,
        now,
    ]
    ws.append(row)

wb.save(VEHICLES_PATH)
print(f"✓ {len(vehicles_data)} vehicles saved to {VEHICLES_PATH}")

# Create admin superuser
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@capauto.fr',
        password='Admin@2024!',
        first_name='Admin',
        last_name='VDL'
    )
    print("✓ Admin user created: admin@capauto.fr / Admin@2024!")
else:
    print("✓ Admin user already exists")

print("\n✅ Sample data creation complete!")
