from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

# Register your models here.


class UserAdmin(BaseUserAdmin):
    # Add 'user_type' to the list display and fieldsets
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_staff', 'is_verified')
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'is_active', 'is_verified')

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('user_type','is_verified',)}),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('user_type','is_verified',)}),
    )

admin.site.register(User, UserAdmin)