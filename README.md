# Voiture de Luxe — Plateforme Automobile de Prestige

Application full-stack de vente de véhicules de luxe.

## Stack technique

- **Frontend**: Next.js 16 · React 19 · TypeScript · Tailwind CSS
- **Backend**: Django 6 · Django REST Framework · JWT Auth
- **Données**: XLSX via openpyxl (remplaçable par PostgreSQL)

## Démarrage rapide

### 1. Backend Django

```powershell
cd backend
..\backend_env\Scripts\python manage.py runserver
```

Backend disponible sur: http://localhost:8000

### 2. Frontend Next.js

```powershell
cd frontend
npm run dev -- --webpack
```

Site disponible sur: http://localhost:3000

## Accès admin

- URL: http://localhost:3000/connexion
- Email: admin@voituredeluxe.fr
- Mot de passe: Admin@2024!

## Architecture

```
voiture_de_luxe/
├── backend/                  # Django API
│   ├── config/               # Settings, URLs
│   ├── core/                 # Repository pattern + Services
│   │   ├── repositories.py   # Abstract interfaces
│   │   ├── spreadsheet_repository.py  # XLSX implementation
│   │   ├── services.py       # Business logic
│   │   └── container.py      # Dependency injection
│   ├── accounts/             # Auth (JWT)
│   ├── vehicles/             # Vehicle CRUD API
│   ├── brands/               # Brands API
│   ├── favorites/            # Favorites
│   ├── messages_app/         # Contact messages
│   ├── dashboard/            # Stats & analytics
│   └── data/                 # XLSX files
├── frontend/                 # Next.js App Router
│   ├── app/                  # Pages
│   │   ├── page.tsx          # Homepage
│   │   ├── vehicules/        # Catalogue
│   │   ├── connexion/        # Login
│   │   ├── admin/            # Admin dashboard
│   │   └── ...
│   ├── components/           # Reusable components
│   ├── lib/                  # API client + utils
│   └── types/                # TypeScript types
└── backend_env/              # Python virtual environment
```

## Migration vers PostgreSQL

Remplacez dans `core/container.py`:
```python
# De:
from .spreadsheet_repository import SpreadsheetVehicleRepository
repo = SpreadsheetVehicleRepository(settings.VEHICLES_XLSX_PATH)

# Vers:
from .django_repository import DjangoVehicleRepository
repo = DjangoVehicleRepository()
```

Aucune modification du frontend nécessaire.

## API Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/auth/login/ | Connexion |
| GET | /api/auth/me/ | Profil |
| GET | /api/vehicles/ | Liste publique |
| GET | /api/vehicles/:id/ | Détail |
| GET | /api/vehicles/filter-options/ | Options de filtres |
| GET | /api/brands/ | Marques |
| GET | /api/dashboard/stats/ | Stats admin |
| POST | /api/messages/create/ | Créer message |
