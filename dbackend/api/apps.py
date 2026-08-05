from django.apps import AppConfig
import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Same Daphne process → InMemoryChannelLayer reaches open sockets
        if os.environ.get('RUN_SAFESIGNAL_BOT', '1') not in ('1', 'true', 'True', 'yes'):
            return
        # Skip during migrate/collectstatic if desired
        import sys
        if any(cmd in sys.argv for cmd in (
            'migrate', 'makemigrations', 'collectstatic', 'check',
            'run_safesignal_bot', 'check_weather',
        )):
            return
        from .bot import start_bot_thread
        start_bot_thread()
