from django.urls import path
from . import views

urlpatterns = [
    path('', views.messages_list, name='messages-list'),
    path('mine/', views.my_messages, name='messages-mine'),
    path('create/', views.messages_create, name='messages-create'),
    path('vehicle/<str:vehicle_id>/', views.messages_by_vehicle, name='messages-by-vehicle'),
    path('<str:message_id>/read/', views.message_mark_read, name='message-read'),
    path('<str:message_id>/reply/', views.message_reply, name='message-reply'),
    path('<str:message_id>/user-reply/', views.user_reply, name='message-user-reply'),
    path('<str:message_id>/delete/', views.message_delete, name='message-delete'),
]
