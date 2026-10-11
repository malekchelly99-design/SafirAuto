from django.urls import path
from . import views

urlpatterns = [
    path('', views.brand_list, name='brand-list'),
    path('create/', views.brand_create, name='brand-create'),
    path('<slug:slug>/', views.brand_detail, name='brand-detail'),
    path('<slug:slug>/update/', views.brand_update_delete, name='brand-update'),
    path('<slug:slug>/logo/', views.brand_upload_logo, name='brand-logo'),
]
