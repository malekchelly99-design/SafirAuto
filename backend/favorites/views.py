from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
import json
import os
from django.conf import settings


def _get_favorites_file(user_id):
    fav_dir = os.path.join(settings.MEDIA_ROOT, 'favorites')
    os.makedirs(fav_dir, exist_ok=True)
    return os.path.join(fav_dir, f'user_{user_id}.json')


def _load_favorites(user_id):
    filepath = _get_favorites_file(user_id)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []


def _save_favorites(user_id, favorites):
    filepath = _get_favorites_file(user_id)
    with open(filepath, 'w') as f:
        json.dump(favorites, f)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorites_list(request):
    favorites = _load_favorites(request.user.id)
    return Response({'favorites': favorites})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def favorites_add(request):
    vehicle_id = request.data.get('vehicle_id')
    if not vehicle_id:
        return Response({'error': 'vehicle_id requis.'}, status=status.HTTP_400_BAD_REQUEST)
    favorites = _load_favorites(request.user.id)
    if vehicle_id not in favorites:
        favorites.append(vehicle_id)
        _save_favorites(request.user.id, favorites)
    return Response({'favorites': favorites})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def favorites_remove(request, vehicle_id):
    favorites = _load_favorites(request.user.id)
    favorites = [f for f in favorites if f != vehicle_id]
    _save_favorites(request.user.id, favorites)
    return Response({'favorites': favorites})
