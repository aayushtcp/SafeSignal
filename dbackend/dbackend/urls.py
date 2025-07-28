"""
URL configuration for dbackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.http import HttpResponse
from django.conf.urls.static import static

admin.site.site_header = "SafeSignal Admin"
admin.site.site_title = "SafeSignal"

urlpatterns = [
    # for admin panel django jet
    path('jet/', include('jet.urls', 'jet')),  # Jet base admin UI
    path('jet/dashboard/', include('jet.dashboard.urls', 'jet-dashboard')),  # optional dashboard
    
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # path('users/', include('users.urls')),
    path('users/', include(('users.urls', 'users'), namespace='users')),
    path('', lambda request: HttpResponse("SafeSignal API Root"), name='home'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
