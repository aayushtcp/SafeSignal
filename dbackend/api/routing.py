from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(
        r'ws/area/(?P<area_name>[^/]+)/$',
        consumers.AreaConsumer.as_asgi(),
    ),
]
