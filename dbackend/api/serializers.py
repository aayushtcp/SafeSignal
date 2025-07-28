from rest_framework import serializers
from .models import UserProfile, Disaster, UserHelp, ImageUpload, UserPreferences

# For country and continent


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user', 'latitude', 'longitude', 'fcm_token']
        
class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['disaster_types', 'radius', 'receive_night_alerts']


class DisasterSerializer(serializers.ModelSerializer):
    triggeredBy = serializers.SerializerMethodField()
    handled_by = serializers.CharField(source='handled_by.username', read_only=True)
    image1 = serializers.SerializerMethodField()

    class Meta:
        model = Disaster
        fields = '__all__'

    def get_triggeredBy(self, obj):
        return obj.triggeredBy.username if obj.triggeredBy else None

    def get_image1(self, obj):
        request = self.context.get('request')
        if obj.image1 and request:
            return request.build_absolute_uri(obj.image1.url)
        return None

        
        
        
        
class UserHelpSerializer(serializers.ModelSerializer):
    verified_by = serializers.CharField(source='verified_by.username', read_only=True)
    claimed_by = serializers.CharField(source='claimed_by.username', read_only=True)

    class Meta:
        model = UserHelp
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get('request')
        images = request.FILES.getlist('images') if request else []

        help_request = UserHelp.objects.create(**validated_data)


        if images:
            if len(images) > 0:
                help_request.image1 = images[0]
            if len(images) > 1:
                help_request.image2 = images[1]
            if len(images) > 2:
                help_request.image3 = images[2]
            if len(images) > 3:
                help_request.image4 = images[3]

            help_request.save()

        return help_request
        
        
        
# Temprary serializer for disaster starts
class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageUpload
        fields = "__all__"
        
        
        
        
    
# Temprary serializer for disaster ends