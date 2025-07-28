from django.db import models
from django.conf import settings
from django.utils import timezone
from geopy.geocoders import Nominatim
import pycountry_convert

OPENCAGE_API_KEY = '2ab594a6cbed43879a5d6043dd88861f'


class Disaster(models.Model):
    disasterType = models.CharField(max_length=100)
    triggeredBy = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='triggeredDisasters', null=True, blank=True
    )
    image1 = models.ImageField(upload_to="disasterImages/", blank=True, null=True)
    image2 = models.ImageField(upload_to="disasterImages/", blank=True, null=True)
    image3 = models.ImageField(upload_to="disasterImages/", blank=True, null=True)
    image4 = models.ImageField(upload_to="disasterImages/", blank=True, null=True)
    
    upvotes = models.IntegerField(blank=True, null=True, default=0)
    date = models.DateField(default=timezone.now)
    time = models.TimeField(default=timezone.now)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    country = models.CharField(max_length=100, blank=True, null=True)
    continent = models.CharField(max_length=100, blank=True, null=True)
    flag_count = models.IntegerField(default=0, blank=True, null=True)
    flagged_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="flagged_disasters", blank=True
    )
    voters = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="voted_disasters", blank=True)
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="handled_disasters"
    )

    def save(self, *args, **kwargs):
        if not self.country or not self.continent:
            try:
                geolocator = Nominatim(user_agent="disaster-app")
                location = geolocator.reverse((self.latitude, self.longitude), language='en', timeout=10)
                if location and location.raw and 'address' in location.raw:
                    address = location.raw['address']
                    self.country = address.get('country', None)
                    country_code = address.get('country_code', '').upper()
                    if country_code:
                        continent_code = pycountry_convert.country_alpha2_to_continent_code(country_code)
                        self.continent = pycountry_convert.convert_continent_code_to_continent_name(continent_code)
            except Exception as e:
                print(f"Nominatim geolocation error: {e}")

        super().save(*args, **kwargs)
        
        
    def __str__(self):
        return f"{self.disasterType} by {self.triggeredBy if self.triggeredBy else 'Anonymous'}"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    latitude = models.FloatField()
    longitude = models.FloatField()
    fcm_token = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"


class UserPreferences(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    disaster_types = models.JSONField(default=list, blank=True)
    radius = models.FloatField(default=10.0)
    receive_night_alerts = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s preferences"
    
    
class ApproveOrganization(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'Organization'}
    )
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    organization_description = models.TextField(blank=True, null=True)
    approved = models.BooleanField(default=False)
    approval_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.organization_name} - Approved: {self.approved}"
    
    
    
# for multiple devices fcm token
class FCMToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fcm_token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}'s token on {self.device_type}"

class UserHelp(models.Model):
    def get_default_admin():
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.filter(is_superuser=True).first()

    HELP_TYPES = [
        ("Money", "Money"),
        ("Food", "Food"),
        ("Both", "Both"),
    ]

    requester_name = models.CharField(max_length=255)
    help_type = models.CharField(max_length=10, choices=HELP_TYPES)

    image1 = models.ImageField(upload_to='HelpImages/', blank=True, null=True)
    image2 = models.ImageField(upload_to='HelpImages/', blank=True, null=True)
    image3 = models.ImageField(upload_to='HelpImages/', blank=True, null=True)
    image4 = models.ImageField(upload_to='HelpImages/', blank=True, null=True)

    approve = models.BooleanField(default=False)
    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        limit_choices_to={'user_type': 'Organization'},
        on_delete=models.SET_NULL,
        related_name='claimedBy', null=True, blank=True
    )
    verification_date = models.DateField(auto_now_add=True)
    def get_admin_users():
        User = settings.AUTH_USER_MODEL
        return User.objects.filter(is_superuser=True)

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'is_superuser': True},
        related_name='verified_helps'
    )

    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"Request by {self.requester_name} - admin is {self.verified_by}"


class ImageUpload(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
