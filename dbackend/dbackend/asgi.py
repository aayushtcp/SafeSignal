"""
ASGI config for dbackend project.

HTTP + WebSocket via Django Channels / Daphne.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dbackend.settings')

# Django must be set up before importing Channels routing / consumers
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter

from api.middleware import JWTAuthMiddlewareStack
from api.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
