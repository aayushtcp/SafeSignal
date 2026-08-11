import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';

import '../main.dart';
import 'api_service.dart';

/// Must be a top-level function for background isolate.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Background FCM: ${message.messageId} ${message.notification?.title}');
}

class FirebaseApi {
  final _firebaseMessaging = FirebaseMessaging.instance;
  static String? fcmToken;

  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'safesignal_alerts',
    'SafeSignal Alerts',
    description: 'Disaster alerts near you',
    importance: Importance.high,
  );

  Future<void> initNotifications() async {
    await _initLocalNotifications();
    await _requestPermissions();

    final token = await _firebaseMessaging.getToken();
    debugPrint('FCM Token: $token');
    fcmToken = token;

    _firebaseMessaging.onTokenRefresh.listen((newToken) async {
      debugPrint('FCM token refreshed');
      fcmToken = newToken;
      await ApiService.registerFcmTokenIfNeeded(token: newToken);
    });

    initPushNotifications();
  }

  Future<void> _requestPermissions() async {
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Android 13+
    if (await Permission.notification.isDenied) {
      await Permission.notification.request();
    }
  }

  Future<void> _initLocalNotifications() async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidInit);

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (response) {
        navigatorKey.currentState?.pushNamed('/notification_screen');
      },
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);
  }

  Future<void> initPushNotifications() async {
    FirebaseMessaging.instance.getInitialMessage().then(_handleOpenedMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleOpenedMessage);

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _showForegroundNotification(message);
    });
  }

  void _handleOpenedMessage(RemoteMessage? message) {
    if (message == null) return;
    navigatorKey.currentState?.pushNamed(
      '/notification_screen',
      arguments: message,
    );
  }

  Future<void> _showForegroundNotification(RemoteMessage message) async {
    final notification = message.notification;
    final title = notification?.title ??
        message.data['title'] ??
        'SafeSignal Alert';
    final body = notification?.body ??
        message.data['body'] ??
        'A nearby disaster was reported.';

    await _localNotifications.show(
      message.hashCode,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
      payload: jsonEncode(message.data),
    );
  }

  /// Re-fetch token and register with backend when a session exists.
  static Future<void> ensureTokenRegistered() async {
    try {
      final messaging = FirebaseMessaging.instance;
      final token = await messaging.getToken();
      fcmToken = token;
      await ApiService.registerFcmTokenIfNeeded(token: token);
    } catch (e) {
      debugPrint('ensureTokenRegistered failed: $e');
    }
  }
}
