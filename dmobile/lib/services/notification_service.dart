import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final _notificationController = StreamController<RemoteMessage>.broadcast();

  Stream<RemoteMessage> get notificationsStream => _notificationController.stream;

  void addNotification(RemoteMessage message) {
    _notificationController.add(message);
  }

  void dispose() {
    _notificationController.close();
  }
}
