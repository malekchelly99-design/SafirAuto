import json
import os
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.container import get_vehicle_service


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    if not request.user.is_staff:
        from rest_framework import status
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    stats = service.get_stats()

    # Message stats
    messages_file = os.path.join(settings.MEDIA_ROOT, 'messages', 'messages.json')
    messages = []
    if os.path.exists(messages_file):
        with open(messages_file, 'r', encoding='utf-8') as f:
            messages = json.load(f)

    unread = len([m for m in messages if not m.get('read')])
    total_messages = len(messages)

    # Simulate catalog views (could be a real counter later)
    views_count = 12840

    return Response({
        'vehicules_actifs': stats.get('active', 0),
        'vehicules_vendus': stats.get('sold', 0),
        'vehicules_brouillon': stats.get('draft', 0),
        'vehicules_reserves': stats.get('reserved', 0),
        'vehicules_total': stats.get('total', 0),
        'vues_catalogue': views_count,
        'demandes_clients': total_messages,
        'demandes_non_lues': unread,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_activity(request):
    if not request.user.is_staff:
        from rest_framework import status
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    # Get 5 most recently updated vehicles for activity feed
    result = service.list_admin_vehicles(ordering='-updated_at', page=1, page_size=5)
    vehicles = result['results']

    activity = []
    for v in vehicles:
        status_label = {
            'PUBLIÉ': 'Véhicule publié',
            'VENDU': 'Véhicule vendu',
            'BROUILLON': 'Brouillon créé',
            'RÉSERVÉ': 'Véhicule réservé',
        }.get(v.get('status', ''), 'Véhicule mis à jour')

        activity.append({
            'type': 'vehicle',
            'label': status_label,
            'vehicle': f"{v.get('brand')} {v.get('model')}",
            'timestamp': v.get('updated_at', ''),
        })

    # Add recent messages
    messages_file = os.path.join(settings.MEDIA_ROOT, 'messages', 'messages.json')
    if os.path.exists(messages_file):
        with open(messages_file, 'r', encoding='utf-8') as f:
            messages = json.load(f)
        for m in messages[:3]:
            activity.append({
                'type': 'message',
                'label': 'Nouvelle demande',
                'vehicle': m.get('vehicle_ref', ''),
                'from': m.get('name', ''),
                'timestamp': m.get('created_at', ''),
            })

    # Sort by timestamp desc
    activity.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return Response(activity[:10])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_sales_chart(request):
    """Returns monthly sales/listing data for charts."""
    if not request.user.is_staff:
        from rest_framework import status
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    # Simulated monthly data — replace with real aggregation later
    months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
              'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    sales = [3, 5, 4, 7, 6, 8, 9, 7, 10, 12, 8, 11]
    listings = [8, 12, 10, 15, 14, 18, 20, 16, 22, 25, 19, 24]

    return Response({
        'months': months,
        'sales': sales,
        'listings': listings,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_brand_distribution(request):
    if not request.user.is_staff:
        from rest_framework import status
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    service = get_vehicle_service()
    result = service.list_admin_vehicles(page_size=1000)
    vehicles = result['results']

    brand_counts = {}
    for v in vehicles:
        brand = v.get('brand', 'Autre')
        brand_counts[brand] = brand_counts.get(brand, 0) + 1

    data = [{'brand': k, 'count': v} for k, v in sorted(brand_counts.items(), key=lambda x: -x[1])]
    return Response(data[:10])
