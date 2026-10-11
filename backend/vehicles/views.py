import os
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response

from core.container import get_vehicle_service
from .serializers import VehicleSerializer, VehicleListSerializer


def _get_paginated_response(request, data_dict):
    """Build paginated response envelope."""
    return Response({
        'count': data_dict['count'],
        'total_pages': data_dict['total_pages'],
        'page': data_dict['page'],
        'page_size': data_dict['page_size'],
        'results': data_dict['results'],
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_list(request):
    """Public listing — only PUBLIÉ vehicles."""
    service = get_vehicle_service()

    filters = {}
    for key in ['brand', 'model', 'condition', 'body_type', 'fuel_type', 'transmission',
                'min_price', 'max_price', 'min_year', 'max_year', 'min_mileage',
                'max_mileage', 'min_horsepower', 'max_horsepower', 'owners_count',
                'featured', 'search', 'equipment']:
        val = request.query_params.get(key)
        if val:
            filters[key] = val

    ordering = request.query_params.get('ordering', '-created_at')
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 12))

    result = service.list_vehicles(filters=filters, ordering=ordering, page=page, page_size=page_size)
    return _get_paginated_response(request, result)


@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_detail(request, vehicle_id):
    """Public vehicle detail."""
    service = get_vehicle_service()
    vehicle = service.get_vehicle(vehicle_id)
    if not vehicle:
        return Response({'error': 'Véhicule non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
    if vehicle.get('status') != 'PUBLIÉ' and not (request.user and request.user.is_staff):
        return Response({'error': 'Véhicule non disponible.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(vehicle)


@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_filter_options(request):
    """Return available filter options."""
    service = get_vehicle_service()
    options = service.get_filter_options()
    brand = request.query_params.get('brand')
    if brand:
        options['models'] = service.get_models_for_brand(brand)
    return Response(options)


# ─── Admin endpoints ────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_vehicle_list(request):
    """Admin listing — all statuses."""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    filters = {}
    for key in ['brand', 'model', 'status', 'condition', 'body_type', 'fuel_type',
                'transmission', 'min_price', 'max_price', 'search']:
        val = request.query_params.get(key)
        if val:
            filters[key] = val

    ordering = request.query_params.get('ordering', '-created_at')
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))

    result = service.list_admin_vehicles(filters=filters, ordering=ordering, page=page, page_size=page_size)
    return _get_paginated_response(request, result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_vehicle_create(request):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    serializer = VehicleSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    vehicle = service.create_vehicle(serializer.validated_data)
    return Response(vehicle, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_vehicle_detail(request, vehicle_id):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    vehicle = service.get_vehicle(vehicle_id)
    if not vehicle:
        return Response({'error': 'Véhicule non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(vehicle)

    if request.method == 'DELETE':
        service.delete_vehicle(vehicle_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT / PATCH
    partial = request.method == 'PATCH'
    serializer = VehicleSerializer(data=request.data, partial=partial)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    updated = service.update_vehicle(vehicle_id, serializer.validated_data)
    return Response(updated)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_vehicle_action(request, vehicle_id, action):
    """Publish, unpublish, mark-sold, mark-reserved, duplicate."""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    try:
        if action == 'publish':
            vehicle = service.publish_vehicle(vehicle_id)
        elif action == 'unpublish':
            vehicle = service.unpublish_vehicle(vehicle_id)
        elif action == 'sold':
            vehicle = service.mark_sold(vehicle_id)
        elif action == 'reserved':
            vehicle = service.mark_reserved(vehicle_id)
        elif action == 'duplicate':
            original = service.get_vehicle(vehicle_id)
            if not original:
                return Response({'error': 'Véhicule non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
            copy = {**original}
            copy.pop('id', None)
            copy.pop('reference', None)
            copy['status'] = 'BROUILLON'
            copy['title'] = f"Copie de {original.get('title', '')}"
            vehicle = service.create_vehicle(copy)
        else:
            return Response({'error': f'Action inconnue: {action}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(vehicle)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def admin_vehicle_upload_image(request, vehicle_id):
    """Upload one or more images for a vehicle."""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    vehicle = service.get_vehicle(vehicle_id)
    if not vehicle:
        return Response({'error': 'Véhicule non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    files = request.FILES.getlist('images')
    if not files:
        return Response({'error': 'Aucune image fournie.'}, status=status.HTTP_400_BAD_REQUEST)

    max_size = settings.MAX_UPLOAD_SIZE
    allowed_types = settings.ALLOWED_IMAGE_TYPES
    saved_urls = []

    vehicle_dir = os.path.join(settings.MEDIA_ROOT, 'vehicles', str(vehicle_id))
    os.makedirs(vehicle_dir, exist_ok=True)

    for f in files:
        if f.content_type not in allowed_types:
            return Response(
                {'error': f'Type de fichier non autorisé: {f.content_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if f.size > max_size:
            return Response(
                {'error': f'Fichier trop volumineux (max 10 MB)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        filename = f.name
        filepath = os.path.join(vehicle_dir, filename)
        with open(filepath, 'wb+') as dest:
            for chunk in f.chunks():
                dest.write(chunk)
        relative = f'vehicles/{vehicle_id}/{filename}'
        saved_urls.append(f'/media/{relative}')

    existing_images = list(vehicle.get('images') or [])
    existing_images.extend(saved_urls)
    primary = vehicle.get('primary_image') or (saved_urls[0] if saved_urls else None)
    updated = service.update_vehicle(vehicle_id, {
        'images': existing_images,
        'primary_image': primary,
    })
    return Response({'images': existing_images, 'primary_image': primary}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_vehicle_delete_image(request, vehicle_id, image_index):
    """Remove an image by index."""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    vehicle = service.get_vehicle(vehicle_id)
    if not vehicle:
        return Response({'error': 'Véhicule non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    images = list(vehicle.get('images') or [])
    idx = int(image_index)
    if idx < 0 or idx >= len(images):
        return Response({'error': 'Index invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    removed = images.pop(idx)
    primary = vehicle.get('primary_image')
    if primary == removed:
        primary = images[0] if images else None

    updated = service.update_vehicle(vehicle_id, {'images': images, 'primary_image': primary})
    return Response({'images': images, 'primary_image': primary})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_vehicle_reorder_images(request, vehicle_id):
    """Reorder images — body: {images: [...ordered URLs]}"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    images = request.data.get('images', [])
    updated = service.update_vehicle(vehicle_id, {
        'images': images,
        'primary_image': images[0] if images else None,
    })
    return Response({'images': images, 'primary_image': images[0] if images else None})
