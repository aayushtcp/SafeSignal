import 'package:firebase_messaging/firebase_messaging.dart';
// Import the service you created

import '../main.dart';

class FirebaseApi {
  final _firebaseMessaging = FirebaseMessaging.instance;
  static String? fcmToken; //storing token statically to send in other screens

  Future<void> initNotifications() async {
  await _firebaseMessaging.requestPermission();
  final token = await _firebaseMessaging.getToken();
  print('FCM Token: $token');
  fcmToken = token;
  initPushNotifications();
  }

  Future<void> initPushNotifications() async {
    // Handle the case when the app is terminated
    FirebaseMessaging.instance.getInitialMessage().then(_handleMessage);

    // Listen for background messages (when the user taps on a notification)
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessage);

    // Listen for foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Instead of navigating, add the message to the notification service stream.
      _handleMessage(message);
    });
  }

  // Instead of navigating, add the message to our NotificationService stream.
void _handleMessage(RemoteMessage? message) {
  if (message == null) return;

  // Navigate to the notification page
  navigatorKey.currentState?.pushNamed(
    '/notification_screen',
    arguments: message,
  );
}
}
