# users/urls.py
from django.urls import path
import api.views as views
from . import views as userviews
from .views import CustomTokenObtainPairView


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.register_view, name='register'),
    path('confirm-email/', userviews.confirm_email, name='confirm-email'), 
]