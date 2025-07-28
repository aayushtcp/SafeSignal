from firebase_admin import messaging
from firebase_admin.exceptions import FirebaseError

def send_push_notification(title, body, fcm_token):
    """Send push notification to a specific user"""
    try:
        # Firebase message payload
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=fcm_token,
        )

        # Send notification
        response = messaging.send(message)
        print('Successfully sent message:', response)
    except FirebaseError as e:
        print(f'FirebaseError sending notification: {str(e)}')
    except Exception as e:
        print(f'General error sending notification: {str(e)}')
