from django.urls import path, include
from rest_framework_simplejwt import views as jwt_views
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from . import views


# Using ViewsSet for quick implementation of API endpoints
router = DefaultRouter()
router.register(r'images', views.ImageUploadViewSet, basename='imageupload')
router.register(r'helprequests', views.HelpRequestViewSet, basename='help_request')

urlpatterns = [
    path('', include(router.urls)),
#     path('token/',
#          jwt_views.TokenObtainPairView.as_view(),
#          name='token_obtain_pair'),
    
    path('token/refresh/',
         jwt_views.TokenRefreshView.as_view(),
         name='token_refresh'),
    path('logout/', views.logout_view, name='logout'),
    path('home/', views.home_view, name='home'),
    path('register/', views.register_view, name='register'),
    path('register-fcm-token/', views.register_fcm_token, name= 'register_fcm_token'),
    path('register-disaster/', views.register_disaster, name='register_disaster'),
    path('disaster-list/', views.disasterList, name='disaster_list'),
    path('disaster-detail/<int:disaster_id>/',
         views.disasterDetail, name='disaster_detail'),
    # To append upvotes for disaster
    path('disaster/<int:disaster_id>/vote/',
         views.appendVote, name="appendvote"),
    # path('update-fcm-token/', views.update_fcm_token, name='update_fcm_token'),

    path('helprequest/', views.help_request, name='help_request'), 
#     `${API_URL}/helprequest/${help_id}/claim
    path('helprequest/<int:help_id>/claim/', views.claim_help_request, name='claim_help_request'),
    
     #Analytics part------------------
     path('disaster-count-by-type/', views.get_disaster_count_by_type, name='dosaster_count_by_type'),   
     path('disaster-count-by-continent/', views.get_disaster_count_by_continent, name='disaster_count_by_continent'),
     path('disaster-count-by-year/', views.get_disaster_count_by_year, name='get_disaster_count_by_year'),
     
     # USer profile update
     path('<str:username>/update-profile/', views.updateProfile, name='updateProfile'),
     path('<str:username>/user-details/', views.user_details, name='user_details'),
     path('<str:username>/preferences/', views.user_preferences_view),
     
     # Organization and filtered disasters list
     path('<str:username>/filtered-disasters/', views.disasterListFiltered, name='filtered_disasters'),
     path('disaster/<int:disaster_id>/take-action/', views.TakeActionView.as_view(), name='take_action'),
     path('test/', lambda request: HttpResponse("Test route works!")),
     path('<str:username>/cooldown/', views.cooldown, name='cooldown'),
     
     
     # Flag/Report a disaster
     path('disaster/<int:disaster_id>/flag/', views.flag_disaster, name='flag_disaster'),
     
     # for delete personal disaster
     path('disaster/<int:disaster_id>/delete/', views.delete_disaster, name='delete_disaster'),
]
