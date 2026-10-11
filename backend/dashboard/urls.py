from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    path('activity/', views.dashboard_activity, name='dashboard-activity'),
    path('sales-chart/', views.dashboard_sales_chart, name='dashboard-sales'),
    path('brand-distribution/', views.dashboard_brand_distribution, name='dashboard-brands'),
]
