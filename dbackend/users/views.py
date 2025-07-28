from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.urls import reverse
from django.core.mail import send_mail
from django.core.signing import BadSignature, SignatureExpired
from .models import User
from django.shortcuts import redirect
from api.models import UserProfile
from .serializers import UserRegistrationSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from .utils import signer  # assuming you keep signer here


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create UserProfile for the registered user
            UserProfile.objects.create(user=user)

            # Send confirmation email
            try:
                send_confirmation_email(user, request, action='signup')
            except Exception as e:
                # Log error but don't block registration success
                print(f"Error sending confirmation email: {e}")

            return Response({'message': 'Registered successfully. Please check your email to confirm.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def generate_confirmation_link(user, request, action='signup'):
    token = signer.sign(user.email)
    url = request.build_absolute_uri(
        reverse('users:confirm-email') + f'?token={token}&action={action}'
    )
    return url


def send_confirmation_email(user, request, action='signup'):
    link = generate_confirmation_link(user, request, action)
    subject = f"{action.capitalize()} Confirmation for SafeSignal"
    message = (
        f"Hello {user.username},\n\n"
        f"Please click the link below to confirm your email for the {action} process:\n\n"
        f"{link}\n\n"
        f"If you did not initiate this request, you can safely ignore this email."
    )

    print("== Sending Email ==")
    print("To:", user.email)
    print("Subject:", subject)
    print("Message:", message)

    send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])


@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_email(request):
    token = request.query_params.get('token')
    action = request.query_params.get('action', 'signup')

    if not token:
        return Response({"detail": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        email = signer.unsign(token, max_age=60*60*24)  # 1 day expiry
        user = User.objects.get(email=email)

        if action == 'signup' and not user.is_verified:
            user.is_verified = True
            user.save()

        # request.session['email_verified'] = True
        return redirect("http://localhost:5173/login")

    except SignatureExpired:
        return Response({"detail": "Confirmation link expired."}, status=status.HTTP_400_BAD_REQUEST)
    except BadSignature:
        return Response({"detail": "Invalid confirmation token."}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)