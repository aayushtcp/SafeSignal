import time

from django.core.management.base import BaseCommand

from api.weather import run_weather_check


class Command(BaseCommand):
    help = (
        'Check OpenWeatherMap for known user/disaster locations and emit '
        'system heat/cold/rain alerts into area chat rooms.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--loop',
            action='store_true',
            help='Keep checking on an interval (demo only; no Celery).',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=600,
            help='Seconds between checks when using --loop (default: 600).',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Ignore the 6-hour dedupe window and recreate alerts.',
        )
        parser.add_argument(
            '--no-broadcast',
            action='store_true',
            help='Save alerts to DB only (skip WebSocket push).',
        )

    def handle(self, *args, **options):
        loop = options['loop']
        interval = max(30, options['interval'])
        force = options['force']
        broadcast = not options['no_broadcast']

        self.stdout.write(self.style.NOTICE(
            'Note: With InMemoryChannelLayer, live WebSocket push works best '
            'from the Django admin "Check Weather Now" button (same process as Daphne). '
            'This CLI still saves Alert + ChatMessage rows to the DB.'
        ))

        while True:
            result = run_weather_check(broadcast=broadcast, force=force)
            if not result.get('ok'):
                self.stderr.write(self.style.ERROR(result.get('error') or 'Weather check failed'))
            else:
                self.stdout.write(
                    f"Checked {result['checked']} location(s); "
                    f"created {result['alerts_created']} alert(s)."
                )
                for item in result.get('created') or []:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  + [{item['alert_type']}] {item['area_name']}: {item['title']}"
                        )
                    )
                for err in result.get('errors') or []:
                    self.stderr.write(self.style.WARNING(f'  ! {err}'))
                if result.get('note'):
                    self.stdout.write(self.style.WARNING(result['note']))

            if not loop:
                break
            self.stdout.write(f'Sleeping {interval}s...')
            time.sleep(interval)
