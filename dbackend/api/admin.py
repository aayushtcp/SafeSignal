from django.contrib import admin
from django.contrib import messages
from django.urls import path, reverse
from django.shortcuts import redirect

from .models import (
    Disaster, UserProfile, UserHelp, UserPreferences,
    ImageUpload, FCMToken, ApproveOrganization, ChatMessage, Alert,
)
from .weather import run_weather_check

admin.site.register(UserProfile)
admin.site.register(FCMToken)
admin.site.register(ApproveOrganization)
admin.site.register(ImageUpload)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('area_name', 'user', 'message_type', 'message', 'created_at')
    list_filter = ('area_name', 'message_type', 'created_at')
    search_fields = ('message', 'area_name', 'user__username')
    readonly_fields = ('created_at',)


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    change_list_template = 'admin/api/alert/change_list.html'
    list_display = (
        'title', 'area_name', 'alert_type', 'source',
        'temperature_c', 'rain_mm', 'created_at',
    )
    list_filter = ('source', 'alert_type', 'area_name', 'created_at')
    search_fields = ('title', 'message', 'area_name')
    readonly_fields = ('created_at',)

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                'check-weather/',
                self.admin_site.admin_view(self.check_weather_view),
                name='api_alert_check_weather',
            ),
        ]
        return custom + urls

    def check_weather_view(self, request):
        force = request.GET.get('force') == '1'
        # Runs inside Daphne → InMemoryChannelLayer can reach live WS clients
        result = run_weather_check(broadcast=True, force=force)
        if not result.get('ok'):
            self.message_user(
                request,
                result.get('error') or 'Weather check failed',
                level=messages.ERROR,
            )
        else:
            created = result.get('alerts_created', 0)
            checked = result.get('checked', 0)
            detail = ', '.join(
                f"{c['alert_type']}@{c['area_name']}" for c in (result.get('created') or [])
            ) or 'none'
            level = messages.SUCCESS if created else messages.INFO
            self.message_user(
                request,
                f'Weather check done. Locations: {checked}. Alerts created: {created} ({detail}).',
                level=level,
            )
            if result.get('note'):
                self.message_user(request, result['note'], level=messages.WARNING)
            for err in (result.get('errors') or [])[:5]:
                self.message_user(request, err, level=messages.WARNING)
        return redirect(reverse('admin:api_alert_changelist'))

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['check_weather_url'] = reverse('admin:api_alert_check_weather')
        extra_context['check_weather_force_url'] = (
            reverse('admin:api_alert_check_weather') + '?force=1'
        )
        return super().changelist_view(request, extra_context=extra_context)


@admin.register(Disaster)
class DisasterAdmin(admin.ModelAdmin):
    fields = [
        'disasterType', 'triggeredBy',
        'upvotes', 'flag_count',
        'flagged_by',
        'date', 'time',
        'description', 'latitude',
        'longitude', 'country',
        'continent', 'voters',
        'handled_by', 'image1',
        'image2', 'image3',
        'image4',
    ]


admin.site.register(UserPreferences)


@admin.register(UserHelp)
class UserHelpAdmin(admin.ModelAdmin):
    pass
