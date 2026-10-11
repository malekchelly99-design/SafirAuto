from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import os
from django.conf import settings

from core.container import get_brand_service


@api_view(['GET'])
@permission_classes([AllowAny])
def brand_list(request):
    service = get_brand_service()
    brands = service.list_brands()
    return Response(brands)


@api_view(['GET'])
@permission_classes([AllowAny])
def brand_detail(request, slug):
    service = get_brand_service()
    brand = service.get_brand(slug)
    if not brand:
        return Response({'error': 'Marque non trouvée.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(brand)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def brand_create(request):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
    service = get_brand_service()
    brand = service.create_brand(request.data)
    return Response(brand, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def brand_update_delete(request, slug):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
    service = get_brand_service()

    if request.method == 'DELETE':
        deleted = service.delete_brand(slug)
        if not deleted:
            return Response({'error': 'Marque non trouvée.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    brand = service.update_brand(slug, request.data)
    return Response(brand)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def brand_upload_logo(request, slug):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    logo_file = request.FILES.get('logo')
    if not logo_file:
        return Response({'error': 'Fichier logo manquant.'}, status=status.HTTP_400_BAD_REQUEST)

    brand_dir = os.path.join(settings.MEDIA_ROOT, 'brands')
    os.makedirs(brand_dir, exist_ok=True)
    filepath = os.path.join(brand_dir, logo_file.name)
    with open(filepath, 'wb+') as dest:
        for chunk in logo_file.chunks():
            dest.write(chunk)

    logo_url = f'/media/brands/{logo_file.name}'
    service = get_brand_service()
    brand = service.update_brand(slug, {'logo': logo_url})
    return Response({'logo': logo_url})
