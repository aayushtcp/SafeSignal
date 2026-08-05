from django.core.management.base import BaseCommand

from api.bot import run_bot_cycle


class Command(BaseCommand):
    help = "Run one SafeSignal Bot cycle (USGS quakes + weather scrapes)."

    def handle(self, *args, **options):
        result = run_bot_cycle()
        self.stdout.write(
            self.style.SUCCESS(
                f"quakes={result['quakes']} weather={result['weather_posts']} "
                f"areas={', '.join(result['areas'])}"
            )
        )
