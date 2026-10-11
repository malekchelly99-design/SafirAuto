from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('', views.vehicle_list, name='vehicle-list'),
    path('filter-options/', views.vehicle_filter_options, name='vehicle-filter-options'),
    path('<str:vehicle_id>/', views.vehicle_detail, name='vehicle-detail'),
    # Admin
    path('admin/list/', views.admin_vehicle_list, name='admin-vehicle-list'),
    path('admin/create/', views.admin_vehicle_create, name='admin-vehicle-create'),
    path('admin/<str:vehicle_id>/detail/', views.admin_vehicle_detail, name='admin-vehicle-detail'),
    path('admin/<str:vehicle_id>/action/<str:action>/', views.admin_vehicle_action, name='admin-vehicle-action'),
    path('admin/<str:vehicle_id>/images/upload/', views.admin_vehicle_upload_image, name='admin-vehicle-upload-image'),
    path('admin/<str:vehicle_id>/images/<int:image_index>/delete/', views.admin_vehicle_delete_image, name='admin-vehicle-delete-image'),
    path('admin/<str:vehicle_id>/images/reorder/', views.admin_vehicle_reorder_images, name='admin-vehicle-reorder-images'),
]
