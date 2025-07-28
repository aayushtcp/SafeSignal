from django.core.mail import send_mail, BadHeaderError
from django.core.signing import TimestampSigner
from django.urls import reverse
from django.conf import settings
import logging

signer = TimestampSigner()
logger = logging.getLogger(__name__)

def generate_confirmation_link(user, request, action='signup'):
    token = signer.sign(user.email)
    path = reverse('users:confirm-email')
    url = request.build_absolute_uri(f"{path}?token={token}&action={action}")
    logger.info(f"Generated confirmation URL: {url}")  # Use logger instead of print
    return url


def send_confirmation_email(user, request, action='signup'):
    logger.info(f"Sending confirmation email to {user.email} for action {action}")
    link = generate_confirmation_link(user, request, action)
    subject = f"{action.capitalize()} Confirmation for SafeSignal"
    message = (
        f"Hello {user.username},\n\n"
        f"Please click the link below to confirm your email for the {action} process:\n\n"
        f"{link}\n\n"
        f"If you did not initiate this request, you can safely ignore this message."
    )

    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False
        )
        logger.info(f"Confirmation email sent to {user.email}")
    except BadHeaderError:
        logger.error(f"Invalid header found when sending email to {user.email}")
    except Exception as e:
        logger.exception(f"Failed to send email to {user.email}: {e}")
