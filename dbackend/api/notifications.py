import logging

import firebase_admin
from firebase_admin import messaging
from firebase_admin.exceptions import FirebaseError
from google.auth.exceptions import RefreshError, GoogleAuthError

logger = logging.getLogger(__name__)

# FCM errors that mean the token should be removed
_INVALID_TOKEN_CODES = {
    "NOT_FOUND",
    "UNREGISTERED",
    "INVALID_ARGUMENT",
}

_creds_error_logged = False


def send_push_notification(title, body, fcm_token, data=None):
    """
    Send a push notification to a device token.
    Returns True on success, False on failure.
    Deletes the FCMToken row when the token is invalid/expired.
    """
    if not firebase_admin._apps:
        logger.warning(
            "Firebase not initialized — skipping push to token ending …%s",
            (fcm_token or "")[-8:],
        )
        return False

    if not fcm_token:
        return False

    payload_data = {"type": "disaster", "title": str(title), "body": str(body)}
    if data:
        payload_data.update({k: str(v) for k, v in data.items()})

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=payload_data,
            token=fcm_token,
        )
        response = messaging.send(message)
        logger.info("Successfully sent message: %s", response)
        return True
    except RefreshError as e:
        global _creds_error_logged
        if not _creds_error_logged:
            _creds_error_logged = True
            logger.error(
                "Firebase Admin credentials rejected by Google (%s). "
                "Regenerate the service account JSON in Firebase Console → "
                "Project settings → Service accounts → Generate new private key, "
                "replace dbackend/api/static/safesignal-db902-firebase-adminsdk-*.json, "
                "then restart the backend container.",
                e,
            )
        return False
    except GoogleAuthError as e:
        logger.error("Google auth error sending notification: %s", e)
        return False
    except FirebaseError as e:
        code = getattr(e, "code", None) or ""
        message_text = str(e)
        logger.error("FirebaseError sending notification: %s", message_text)

        should_prune = (
            code.upper() in _INVALID_TOKEN_CODES
            or "not-found" in message_text.lower()
            or "unregistered" in message_text.lower()
            or "registration-token-not-registered" in message_text.lower()
            or "requested entity was not found" in message_text.lower()
        )
        if should_prune:
            _delete_invalid_token(fcm_token)
        return False
    except Exception as e:
        logger.exception("Error sending notification: %s", e)
        return False


def _delete_invalid_token(fcm_token):
    try:
        from .models import FCMToken

        deleted, _ = FCMToken.objects.filter(fcm_token=fcm_token).delete()
        if deleted:
            logger.info("Pruned invalid FCM token ending …%s", fcm_token[-8:])
    except Exception as e:
        logger.exception("Failed to prune FCM token: %s", e)
