from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    USER_TYPES = (
        ('Normal', 'Normal'),
        ('Organization', 'Organization'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='Normal')
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username
