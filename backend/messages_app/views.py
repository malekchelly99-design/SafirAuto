import json
import os
import uuid
from datetime import datetime

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response


def _get_messages_file():
    data_dir = os.path.join(settings.MEDIA_ROOT, 'messages')
    os.makedirs(data_dir, exist_ok=True)
    return os.path.join(data_dir, 'messages.json')


def _load_messages():
    filepath = _get_messages_file()
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def _save_messages(messages):
    filepath = _get_messages_file()
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages_list(request):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
    messages = _load_messages()
    return Response(messages)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_messages(request):
    """Returns messages sent by the currently authenticated user."""
    messages = _load_messages()
    user_msgs = [m for m in messages if m.get('user_id') == str(request.user.id)]
    return Response(user_msgs)


@api_view(['POST'])
@permission_classes([AllowAny])
def messages_create(request):
    data = request.data
    required = ['name', 'email', 'subject', 'message']
    for field in required:
        if not data.get(field):
            return Response({'error': f'{field} est requis.'}, status=status.HTTP_400_BAD_REQUEST)

    messages = _load_messages()
    user_id = str(request.user.id) if request.user.is_authenticated else None
    vehicle_id = data.get('vehicle_id')

    # Try to find existing unread thread from same user (and same vehicle if provided)
    existing_thread = None
    for m in messages:
        if m.get('user_id') == user_id and not m.get('read', False):
            if vehicle_id and m.get('vehicle_id') == vehicle_id:
                existing_thread = m
                break
            elif not vehicle_id and not m.get('vehicle_id'):
                existing_thread = m
                break

    if existing_thread:
        # Add as reply to existing thread
        if 'replies' not in existing_thread:
            existing_thread['replies'] = []
        reply = {
            'id': str(uuid.uuid4()),
            'text': data['message'],
            'author': data['name'],
            'created_at': datetime.now().isoformat(),
        }
        existing_thread['replies'].append(reply)
        existing_thread['subject'] = data['subject']  # Update subject
        _save_messages(messages)
        return Response(existing_thread, status=status.HTTP_200_OK)

    # Create new thread
    msg = {
        'id': str(uuid.uuid4()),
        'name': data['name'],
        'email': data['email'],
        'phone': data.get('phone', ''),
        'subject': data['subject'],
        'message': data['message'],
        'vehicle_id': vehicle_id,
        'vehicle_ref': data.get('vehicle_ref', ''),
        'user_id': user_id,
        'read': False,
        'replies': [],
        'created_at': datetime.now().isoformat(),
    }
    messages.insert(0, msg)
    _save_messages(messages)
    return Response(msg, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def message_reply(request, message_id):
    """Admin replies to a message. Reply is stored inside the message object."""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'Le texte de la réponse est requis.'}, status=status.HTTP_400_BAD_REQUEST)

    messages = _load_messages()
    for m in messages:
        if m['id'] == message_id:
            if 'replies' not in m:
                m['replies'] = []
            reply = {
                'id': str(uuid.uuid4()),
                'text': text,
                'author': request.user.first_name or request.user.username,
                'role': 'admin',
                'created_at': datetime.now().isoformat(),
            }
            m['replies'].append(reply)
            m['read'] = True
            _save_messages(messages)
            return Response(m)
    return Response({'error': 'Message non trouvé.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages_by_vehicle(request, vehicle_id):
    """Returns all messages for a given vehicle (admin) or the user's own messages for that vehicle."""
    messages = _load_messages()
    if request.user.is_staff:
        filtered = [m for m in messages if m.get('vehicle_id') == vehicle_id]
    else:
        filtered = [m for m in messages if m.get('vehicle_id') == vehicle_id and m.get('user_id') == str(request.user.id)]
    return Response(filtered)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def message_mark_read(request, message_id):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
    messages = _load_messages()
    for m in messages:
        if m['id'] == message_id:
            m['read'] = True
            _save_messages(messages)
            return Response(m)
    return Response({'error': 'Message non trouvé.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def message_delete(request, message_id):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
    messages = _load_messages()
    new_messages = [m for m in messages if m['id'] != message_id]
    _save_messages(new_messages)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_reply(request, message_id):
    """User replies to an admin message in their thread."""
    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'Le texte de la réponse est requis.'}, status=status.HTTP_400_BAD_REQUEST)

    messages = _load_messages()
    for m in messages:
        if m['id'] == message_id:
            # Check ownership
            if m.get('user_id') != str(request.user.id):
                return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)
            
            if 'replies' not in m:
                m['replies'] = []
            reply = {
                'id': str(uuid.uuid4()),
                'text': text,
                'author': request.user.first_name or request.user.username,
                'role': 'user',
                'created_at': datetime.now().isoformat(),
            }
            m['replies'].append(reply)
            m['read'] = True  # Mark as read when user replies
            _save_messages(messages)
            return Response(m)
    return Response({'error': 'Message non trouvé.'}, status=status.HTTP_404_NOT_FOUND)
