# users/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from api.models import ApproveOrganization


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'user_type']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            user_type=validated_data['user_type'],
            is_verified=False
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if not user.is_verified:
            raise serializers.ValidationError("Email not verified.")
        # Check if user is Organization and approval is required
        if user.user_type == 'Organization':
            try:
                approval = ApproveOrganization.objects.get(user=user)
                if not approval.approved:
                    raise serializers.ValidationError(
                        "Organization not approved.")
            except ApproveOrganization.DoesNotExist:
                raise serializers.ValidationError(
                    "Organization approval not found.")
        data['user_type'] = user.user_type
        data['email'] = user.email
        return data
