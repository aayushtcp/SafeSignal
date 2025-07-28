from django.contrib import admin
from django.contrib.auth.models import User
from .models import Disaster, UserProfile, UserHelp,UserPreferences, ImageUpload,FCMToken, ApproveOrganization
# Register your models here.

# admin.site.register(Disaster)
admin.site.register(UserProfile)
admin.site.register(FCMToken)
admin.site.register(ApproveOrganization)
admin.site.register(ImageUpload)

@admin.register(Disaster)
class DisasterAdmin(admin.ModelAdmin):
    # readonly_fields = ['date']

    fields = [
        'disasterType', 'triggeredBy',
        'upvotes','flag_count',
        'flagged_by',
        'date', 'time',
        'description', 'latitude',
        'longitude', 'country',
        'continent', 'voters',
        'handled_by','image1',
        'image2','image3',
        'image4',
    ]

admin.site.register(UserPreferences)

@admin.register(UserHelp)
class UserHelpAdmin(admin.ModelAdmin):
    pass


