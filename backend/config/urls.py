from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/brands/', include('brands.urls')),
    path('api/favorites/', include('favorites.urls')),
    path('api/messages/', include('messages_app.urls')),
    path('api/dashboard/', include('dashboard.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
