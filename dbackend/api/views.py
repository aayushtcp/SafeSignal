from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
# from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Disaster, UserProfile, UserHelp , UserPreferences,FCMToken,ApproveOrganization,ImageUpload 
from users.utils import send_confirmation_email
from .serializers import DisasterSerializer, UserHelpSerializer, ImageUploadSerializer, UserPreferencesSerializer
from .notifications import send_push_notification
import re
from datetime import datetime
# for algorithm
from math import radians, cos, sin, sqrt, atan2
from .services import current_local_time
from django.db.models import Q
from django.db.models import Count
from django.conf import settings
User = get_user_model()



# Harversine algorithm
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_view(request):
    print(f"USER IS: {request.user.username}")
    print(request.user.user_type)
    content = {'message': "Welcome to django rest jwt", 'user': request.user.username}
    return Response(content)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        logout_source = request.data.get("logout_source")
        fcm_token_qs = FCMToken.objects.filter(user=request.user)
        if logout_source:
            fcm_token_qs = fcm_token_qs.filter(device_type=logout_source)
        if fcm_token_qs.exists():
            fcm_token_qs.delete()
            print("Token Deleted by logout")

        refresh_token = request.data.get("refresh_token")
        if (refresh_token):
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        else:
            return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    print("USER IS CREATING")
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
    user_type = request.data.get("user_type", "Normal")
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")
    fcm_token = request.data.get("fcm_token")

    if not username or not password or not email:
        return Response(
            {"detail": "Username, password, and email are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"detail": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"detail": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        print("Creating user...")
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type=user_type,
            is_verified=False  # or whatever your field name is
        )
        user.save()
        if user_type == 'Organization':
            # Create an entry in ApproveOrganization for organizations
            print("Creating ApproveOrganization entry...")
            ApproveOrganization.objects.create(user=user, organization_name=username)

        # Validate latitude and longitude before creating UserProfile
        if latitude is None or longitude is None:
            return Response(
                {"detail": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert to float, catch errors if any
        try:
            lat = float(latitude)
            lon = float(longitude)
        except ValueError:
            return Response(
                {"detail": "Invalid latitude or longitude values"},
                status=status.HTTP_400_BAD_REQUEST
            )

        UserProfile.objects.create(
            user=user,
            latitude=lat,
            longitude=lon,
            fcm_token=fcm_token or ""
        )
        print("Created UserProfile...")

        send_confirmation_email(user, request, action='signup')
        print("Confirmation email sent.")

        return Response({
            "detail": "User registered. Please check your email to verify your account."
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("Here is error:", e)
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_fcm_token(request):
    fcm_token = request.data.get('fcmToken')
    device_type = request.data.get('device', 'unknown')
    print(f"===[ Token Received ]===: {fcm_token}")
    if not fcm_token:
        return Response({"detail": "FCM token is required."}, status=400)

    # Only create, do not update existing tokens
    FCMToken.objects.create(
        user=request.user,
        fcm_token=fcm_token,
        device_type=device_type
    )

    return Response({"detail": "Token registered successfully."})


@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def updateProfile(request, username):
    """Update user profile"""
    user = request.user

    if user.username != username:
        return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    try:
        user_profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return Response({"detail": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    files = request.FILES
    updated = False

    # Username update
    new_username = data.get("username")
    if new_username and new_username != user.username:
        if User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
            return Response({"detail": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        user.username = new_username
        updated = True

    # Email update
    email = data.get("email")
    if email and email != user.email:
        if User.objects.exclude(pk=user.pk).filter(email=email).exists():
            return Response({"detail": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        user.email = email
        updated = True

    # Bio update
    bio = data.get("bio")
    if bio and bio != user_profile.bio:
        user_profile.bio = bio
        updated = True

    # Profile picture
    profile_picture = files.get("profilePicture")
    if profile_picture:
        user_profile.profile_picture = profile_picture
        updated = True

    # Password update
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    confirm_password = data.get("confirmPassword")

    if current_password and new_password and confirm_password:
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"detail": "New password and confirm password do not match"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        updated = True

    if updated:
        user.save()
        user_profile.save()
        return Response({"detail": "Profile updated successfully"}, status=status.HTTP_200_OK)

    return Response({"detail": "No Updates"}, status=status.HTTP_200_OK)



# for disaster regitration
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def register_disaster(request):
    print("\n========== [REGISTER DISASTER ENDPOINT CALLED] ==========")
    print(f"[HEADERS]: {request.headers}")

    user = request.user
    is_authenticated = user.is_authenticated
    username = user.username if is_authenticated else "Anonymous"
    print(f"[USER STATUS]: {username}")

    data = request.data
    try:
        disaster_type = data["disasterType"]
        description = data["description"]
        latitude = float(data["latitude"])
        longitude = float(data["longitude"])
    except (KeyError, TypeError, ValueError) as e:
        print(f"[ERROR]: Invalid or missing input data - {e}")
        return Response(
            {"detail": "Disaster type, description, latitude, and longitude are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    image1 = data.get("image1")
    image2 = data.get("image2")
    image3 = data.get("image3")
    image4 = data.get("image4")

    if is_authenticated:
        print("[AUTH STATUS]: Authenticated")
        if not cooldown(username):
            return Response(
                {"detail": "You have reached the limit of registering disasters within the cooldown period."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        triggered_by = user
    else:
        print("[AUTH STATUS]: Not Authenticated")
        if not cooldown(None, latitude, longitude):
            return Response(
                {"detail": "You have reached the limit of registering disasters within the cooldown period."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        triggered_by = None

    print(f"[TRIGGERED BY]: {triggered_by}")

    try:
        current_time = datetime.now()
        print("[INFO]: Creating Disaster object...")
        disaster = Disaster.objects.create(
            disasterType=disaster_type,
            description=description,
            latitude=latitude,
            longitude=longitude,
            image1=image1,
            image2=image2,
            image3=image3,
            image4=image4,
            triggeredBy=triggered_by,
            date=current_time.date(),
            time=current_time.time()
        )

        print("[INFO]: Disaster created successfully")

        print("\n========== [NOTIFYING USERS] ==========")
        nearby_profiles = UserProfile.objects.exclude(latitude__isnull=True, longitude__isnull=True)
        default_types = ["Fire", "Tornado", "Landslide", "Flood"]
        for profile in nearby_profiles:
            
            username = profile.user.username
            preferences = UserPreferences.objects.filter(user=profile.user).first()
            selected_radius = preferences.radius if preferences else 10.0
            selected_types = preferences.disaster_types if preferences and preferences.disaster_types else default_types
            night_alerts = preferences.receive_night_alerts if preferences else True 
            is_day = current_local_time(profile.latitude, profile.longitude)
            print(f"The is_day is: {is_day} and user night aler is set to {night_alerts}")

            distance_km = haversine(latitude, longitude, profile.latitude, profile.longitude)
            print(f"[CHECKING] {username} is {distance_km:.2f} km away (radius: {selected_radius} km)")
            print(f"[SELECTED TYPES] {selected_types}")
            if distance_km <= selected_radius and disaster_type.capitalize() in [d.capitalize() for d in selected_types]:
                
                tokens = FCMToken.objects.filter(user=profile.user)
                if not tokens.exists():
                    print(f"[WARN] No FCM token found for {username}")
                    continue

                for token in tokens:
                    print(f"[INFO] Sending to {token.device_type} token: {token.fcm_token}")
                    send_push_notification(
                        title=f"New {disaster_type} Reported!",
                        body=f"A {disaster_type} has been reported nearby. Stay alert!",
                        fcm_token=token.fcm_token
                    )

        print("========== [PROCESS COMPLETE] ==========")
        return Response(
            {"detail": "Disaster registered successfully"},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print(f"[ERROR]: Exception occurred - {e}")
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flag_disaster(request, disaster_id):
    """Flag a disaster as inappropriate (increments flag count, one flag per user)"""
    try:
        disaster = Disaster.objects.get(id=disaster_id)
        user = request.user
        

        # Ensure flagged_by is a ManyToManyField and always update flag_count based on unique users
        if hasattr(disaster, 'flagged_by'):
            if disaster.flagged_by.filter(id=user.id).exists():
                print("User has already flagged this disaster.-------------")
                return Response({"detail": "You have already flagged this disaster."}, status=status.HTTP_400_BAD_REQUEST)
            disaster.flagged_by.add(user)
            disaster.flag_count = disaster.flagged_by.count()
        else:
            if hasattr(disaster, 'flag_count'):
                disaster.flag_count += 1
                disaster.flagged_by.add(user)
                print("LES GOOO.-------------")
            else:
                disaster.flag_count = 1

        disaster.save()
        return Response({"detail": "Disaster flagged successfully", "flag_count": disaster.flag_count}, status=status.HTTP_200_OK)
    except Disaster.DoesNotExist:
        return Response({"detail": "Disaster not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
def cooldown(username=None, lat=None, lon=None):
    """Check cooldown period for a user"""
    try:
        current_time = datetime.now()
        recent_disasters = []

        if username:
            registered_disasters = Disaster.objects.filter(triggeredBy__username=username)
        elif lat is not None and lon is not None:
            registered_disasters = Disaster.objects.filter(
                Q(latitude=lat, longitude=lon) |
                Q(latitude__range=(lat - 0.0045, lat + 0.0045), longitude__range=(lon - 0.0045, lon + 0.0045))
            )
        else:
            return Response({"error": "Username or location (lat, lon) must be provided"}, status=status.HTTP_400_BAD_REQUEST)

        for disaster in registered_disasters:
            time_difference = current_time - datetime.combine(disaster.date, disaster.time)
            if time_difference.total_seconds() <= 86400:
                recent_disasters.append(disaster)

        if len(recent_disasters) >= 3:
            return False

        return True
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
# Disaster list
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def disasterList(request):
    """Disaster List"""
    try:
        disasters = Disaster.objects.all()
        serializer = DisasterSerializer(disasters, many=True)

        if request.user.is_authenticated:
            return Response(
                {
                    "logged_user": request.user.username,
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {
                    "logged_user": "Unknown",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

    except Exception as e:
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    # try:
    #     disasters = Disaster.objects.select_related("triggeredBy").all()
    #     # !Pause for now
    #     # alreadyVoters = []
    #     # all_voters = Disaster.
    #     data = [
    #         {
    #             "id": disaster.id,
    #             "disasterType": disaster.disasterType,
    #             "description": disaster.description,
    #             "triggeredBy_username": disaster.triggeredBy.username if disaster.triggeredBy else "Anonymous User",
    #             "upvotes": disaster.upvotes,
    #             "date": disaster.date,
    #             "latitude": disaster.latitude,
    #             "longitude": disaster.longitude,
    #             "voters": list(disaster.voters.values_list("username", flat=True)),
    #             "logged_user": request.user.username
    #         }
    #         for disaster in disasters
    #     ]
    #     finalData = {
    #         "data": data,
    #         "logged_user": request.user.username,
    #     }
    #     return Response(finalData, status=status.HTTP_200_OK)
    
            

    # except Exception as e:
    #     print(f"Error fetching disasters: {e}")
    #     return Response(
    #         {"detail": f"An error occurred: {str(e)}"},
    #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
    #     )
        
        
# Disaster list by filtered radius
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def disasterListFiltered(request, username):
    """Disaster List by filtered radius"""
    try:
        user_profile = UserProfile.objects.get(user__username=username)
        user_latitude = user_profile.latitude
        user_longitude = user_profile.longitude

        if user_latitude is None or user_longitude is None:
            return Response(
                {"detail": "User location is not set"},
                status=status.HTTP_400_BAD_REQUEST
            )

        disasters = Disaster.objects.all()
        filtered_disasters = []

        for disaster in disasters:
            if disaster.latitude is not None and disaster.longitude is not None:
                distance = haversine(user_latitude, user_longitude, disaster.latitude, disaster.longitude)
                if distance <= 10:
                    filtered_disasters.append(disaster)

        serializer = DisasterSerializer(filtered_disasters, many=True)
        return Response(
            {
                "logged_user": request.user.username,
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    except UserProfile.DoesNotExist:
        return Response(
            {"detail": "User profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET'])
@permission_classes([AllowAny])
def disasterDetail(request, disaster_id):
    """Disaster Detail"""
    try:
        disaster = Disaster.objects.get(id = disaster_id)
        serializer = DisasterSerializer(disaster, context={'request': request})
        
        return Response(serializer.data , status = status.HTTP_200_OK)
    except Exception as e:
        print("Error")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )
        
class TakeActionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, disaster_id):
        if request.user.user_type != 'Organization':
            return Response({'detail': 'Only organizations can take action.'}, status=403)

        try:
            disaster = Disaster.objects.get(pk=disaster_id)
            if hasattr(disaster, 'handled_by') and disaster.handled_by:
                return Response({'detail': 'Disaster is already handled.'}, status=400)
        except Disaster.DoesNotExist:
            return Response({'detail': 'Disaster not found'}, status=404)

        disaster.handled_by = request.user
        disaster.save()

        return Response({'detail': 'Disaster marked as handled.'})

# Append Vote or Increase Vote
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def appendVote(request, disaster_id):
    alreadyVoters = []
    try:
        disaster = Disaster.objects.get(id=disaster_id)
        user = request.user

        # Refresh the relationship to ensure it's updated
        disaster.refresh_from_db()

        # Check if the user has already voted
        if disaster.voters.filter(id=user.id).exists():
            for item in disaster.voters.all():
                alreadyVoters.append(item.username)     
                
            data = [
                {
                    "username": item
                }
                
                for item in alreadyVoters
            ]
            print(alreadyVoters)
            return Response(
                {"alreadyvoters": data ,"message": "You have already voted for this disaster."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Add user to voters and increment upvotes
        disaster.voters.add(user)
        disaster.upvotes += 1
        disaster.save()
        
        # print("Voters:", list(disaster.voters.values_list("username", flat=True)))
        for item in disaster.voters.all():
            alreadyVoters.append(item.username)     
            
        data = [
            {
                "username": item
            }
            
            for item in alreadyVoters
        ]
        print(alreadyVoters)
           

        return Response(
            {"message": "Vote added successfully.", "upvotes": disaster.upvotes, "alreadyvoters": data},
            status=status.HTTP_200_OK,
        )

    except Disaster.DoesNotExist:
        return Response(
            {"error": "Disaster not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )




'''
=============================== HELP Entity Starts ==========================
=============================================================================
'''



@api_view(['POST'])
@permission_classes([AllowAny])
def help_request(request):
    data = request.data

    requester_name = data.get("requesterName")
    help_type = data.get("helpType")
    image1 = data.get("image1")
    image2 = data.get("image2")
    image3 = data.get("image3")
    image4 = data.get("image4")
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not requester_name or not help_type or latitude is None or longitude is None:
        return Response(
            {"detail": "Requester Name, Help Type, latitude, and longitude are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        userhelp = UserHelp.objects.create(
            requester_name=requester_name,
            help_type=help_type,
            image1=image1,
            image2=image2,
            image3=image3,
            image4=image4,
            latitude=float(latitude),
            longitude=float(longitude),
        )
        userhelp.save()
        return Response(
            {"detail": "Disaster registered successfully"},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )


class HelpRequestViewSet(viewsets.ModelViewSet):
    queryset = UserHelp.objects.all()
    serializer_class = UserHelpSerializer
    permission_classes = [IsAuthenticated]
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def claim_help_request(request, help_id):
    """
    Claim a help request. Expects 'org_id' in request.data.
    """
    try:
        help_request = UserHelp.objects.get(id=help_id)
        user = request.user

        # Optionally, check if user.id == org_id from frontend for extra validation
        org_id = request.data.get("org_id")
        if org_id and str(user.id) != str(org_id):
            return Response({"detail": "You are not authorized to claim this request."}, status=status.HTTP_403_FORBIDDEN)

        if help_request.claimed_by:
            return Response({"detail": "This help request has already been claimed."}, status=status.HTTP_400_BAD_REQUEST)

        help_request.claimed_by = user
        help_request.save()

        return Response({
            "detail": "Help request claimed successfully.",
            "claimed_by": user.username
        }, status=status.HTTP_200_OK)

    except UserHelp.DoesNotExist:
        return Response({"detail": "Help request not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
        
    
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def user_details(request, username):
    try:
        user = User.objects.get(username=username)
        user_profile = UserProfile.objects.get(user=user)

        data = {
            "username": user.username,
            "email": user.email,
            "bio": user_profile.bio,
            "latitude": user_profile.latitude,
            "longitude": user_profile.longitude,
            "user_type": user.user_type,
            "profile_picture": request.build_absolute_uri(user_profile.profile_picture.url) if user_profile.profile_picture else None
        }

        return Response(data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_preferences_view(request, username):
    print("HITTED")
    user = request.user

    preferences, created = UserPreferences.objects.get_or_create(user=user)

    if request.method == 'GET':
        serializer = UserPreferencesSerializer(preferences)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# Analytics for Disaster
@permission_classes([AllowAny])
@api_view(['GET'])
def get_disaster_count_by_type(request):
    '''giving all disaster count by type'''
    try:
        disaster_counts = Disaster.objects.values('disasterType').annotate(count=Count('id'))
        return Response(disaster_counts, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error fetching disaster counts: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )



@permission_classes([AllowAny])
@api_view(['GET'])
def get_disaster_count_by_continent(request):
    '''giving all disaster count by continent'''
    try:
        disaster_counts = Disaster.objects.values('continent').annotate(count=Count('id'))
        return Response(disaster_counts, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error fetching disaster counts: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )
        
        
@permission_classes([AllowAny])
@api_view(['GET'])
def get_disaster_count_by_year(request):
    '''giving all disaster count by year'''
    try:
        disaster_counts = Disaster.objects.extra(select={'year': "strftime('%Y', date)"}).values('year').annotate(count=Count('id'))
        return Response(disaster_counts, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error fetching disaster counts: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )





'''
=============================== HELP Entity Ends ==========================
=============================================================================
'''



'''
=============================== DELETE SYSTEM Starts ==========================
=============================================================================
'''
@permission_classes([IsAuthenticated])
@api_view(['DELETE'])
def delete_disaster(request, disaster_id):
    """Delete a disaster by ID"""
    try:
        print("WOOOO")
        disaster = Disaster.objects.get(id=disaster_id)
        if request.user != disaster.triggeredBy:
            return Response({"detail": "You do not have permission to delete this disaster."}, status=status.HTTP_403_FORBIDDEN)

        disaster.delete()
        return Response({"detail": "Disaster deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    except Disaster.DoesNotExist:
        print("WOOOO2")
        return Response({"detail": "Disaster not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print("WOOOO3")
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)




'''
=============================== DELETE SYSTEM Ends ==========================
=============================================================================
'''



# Temporary
class ImageUploadViewSet(viewsets.ModelViewSet):
    queryset = ImageUpload.objects.all()
    serializer_class = ImageUploadSerializer

