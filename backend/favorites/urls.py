from django.urls import path
from . import views

urlpatterns = [
    path('', views.favorites_list, name='favorites-list'),
    path('add/', views.favorites_add, name='favorites-add'),
    path('<str:vehicle_id>/', views.favorites_remove, name='favorites-remove'),
]
