import json
import re

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .models import ChatMessage


def normalize_area_name(area_name: str) -> str:
    """Channels group names: ASCII alphanumerics, hyphens, underscores, periods."""
    slug = re.sub(r'[^a-zA-Z0-9._-]+', '_', (area_name or '').strip().lower())
    return (slug[:100] or 'general').strip('._-') or 'general'


def area_group_name(area_name: str) -> str:
    return f'area_{normalize_area_name(area_name)}'


class AreaConsumer(AsyncWebsocketConsumer):
    """One WebSocket per area — chat + system alerts share this connection."""

    async def connect(self):
        raw_area = self.scope['url_route']['kwargs'].get('area_name', 'general')
        self.area_name = normalize_area_name(raw_area)
        self.group_name = area_group_name(self.area_name)

        user = self.scope.get('user')
        if user is None or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        history = await self.get_recent_messages()
        await self.send(text_data=json.dumps({
            'type': 'history',
            'area_name': self.area_name,
            'messages': history,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON',
            }))
            return

        # Clients send chat as {"type": "chat", "message": "..."} (type optional)
        msg_type = (data.get('type') or 'chat').strip().lower()
        if msg_type != 'chat':
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Clients may only send type=chat',
            }))
            return

        message = (data.get('message') or '').strip()
        if not message:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Message cannot be empty',
            }))
            return

        if len(message) > 2000:
            message = message[:2000]

        saved = await self.save_message(message)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'area.event',
                'data': saved,
            },
        )

        # /update → fetch weather for this area and post as SafeSignal Bot
        cmd = message.lower().split()[0] if message else ''
        if cmd == '/update':
            await self.run_weather_update()

    async def area_event(self, event):
        """Forward chat/alert payloads to this socket."""
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def run_weather_update(self):
        from .bot import post_bot, weather_brief
        post_bot(self.area_name, weather_brief(self.area_name))

    @database_sync_to_async
    def save_message(self, message: str) -> dict:
        msg = ChatMessage.objects.create(
            area_name=self.area_name,
            user=self.scope['user'],
            message=message,
            message_type='user',
        )
        return {
            'type': 'chat',
            'id': msg.id,
            'area_name': msg.area_name,
            'message': msg.message,
            'sender': msg.user.username if msg.user else 'anonymous',
            'user_id': msg.user_id,
            'created_at': msg.created_at.isoformat(),
        }

    @database_sync_to_async
    def get_recent_messages(self, limit: int = 50) -> list:
        qs = (
            ChatMessage.objects
            .filter(area_name=self.area_name)
            .select_related('user')
            .order_by('-created_at')[:limit]
        )
        messages = list(reversed(list(qs)))
        out = []
        for m in messages:
            if m.message_type == 'system':
                out.append({
                    'type': 'alert',
                    'id': m.id,
                    'area_name': m.area_name,
                    'message': m.message,
                    'sender': 'SafeSignal Bot',
                    'created_at': m.created_at.isoformat(),
                })
            elif m.message_type == 'bot':
                out.append({
                    'type': 'chat',
                    'id': m.id,
                    'area_name': m.area_name,
                    'message': m.message,
                    'sender': 'SafeSignal Bot',
                    'user_id': None,
                    'created_at': m.created_at.isoformat(),
                })
            else:
                out.append({
                    'type': 'chat',
                    'id': m.id,
                    'area_name': m.area_name,
                    'message': m.message,
                    'sender': m.user.username if m.user else 'anonymous',
                    'user_id': m.user_id,
                    'created_at': m.created_at.isoformat(),
                })
        return out


# Backwards-compatible alias
ChatConsumer = AreaConsumer
