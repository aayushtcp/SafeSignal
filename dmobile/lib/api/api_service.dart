import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import './firebase_api.dart';
import '../utils/api_url.dart';
import 'package:dmobile/utils/secure_storage.dart';

class ApiService {
  static const String baseUrl = MyApi.apiurl;
  static const String userUrl = MyApi.usersurl;

  static Future<Map<String, dynamic>?> login(
      String username, String password) async {
    final response = await http.post(
      Uri.parse('${userUrl}token/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final accessToken = data['access'];
      final refreshToken = data['refresh'];

      await SecureStorage.saveToken(accessToken, refreshToken);
      await registerFcmTokenIfNeeded(
        token: FirebaseApi.fcmToken,
        accessToken: accessToken,
      );

      return data;
    } else {
      return null;
    }
  }

  /// Register (or re-register) the device FCM token with the backend.
  static Future<void> registerFcmTokenIfNeeded({
    String? token,
    String? accessToken,
  }) async {
    final fcmToken = token ?? FirebaseApi.fcmToken;
    final authToken = accessToken ?? await SecureStorage.getAccessToken();

    if (authToken == null ||
        authToken.isEmpty ||
        fcmToken == null ||
        fcmToken.isEmpty) {
      return;
    }

    try {
      final fcmResponse = await http.post(
        Uri.parse('${baseUrl}register-fcm-token/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({'fcmToken': fcmToken, 'device': 'mobile'}),
      );
      debugPrint('FCM token registration status: ${fcmResponse.statusCode}');
      debugPrint('FCM token registration response: ${fcmResponse.body}');
    } catch (e) {
      debugPrint('FCM token registration failed: $e');
    }
  }

  static Future<bool> register(String username, String password) async {
    final response = await http.post(
      Uri.parse('${baseUrl}register/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    return response.statusCode == 201;
  }

  static Future<void> logout() async {
    final accessToken = await SecureStorage.getAccessToken();
    final refreshToken = await SecureStorage.getRefreshToken();

    if (accessToken != null && refreshToken != null) {
      try {
        await http.post(
          Uri.parse('${baseUrl}logout/'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
          body: jsonEncode({
            'refresh_token': refreshToken,
            'logout_source': 'mobile',
          }),
        );
      } catch (e) {
        debugPrint('Logout API failed (clearing local tokens anyway): $e');
      }
    }

    await SecureStorage.deleteToken();
  }

  static Future<bool> refreshAccessToken() async {
    String? refreshToken = await SecureStorage.getRefreshToken();
    if (refreshToken == null) return false;

    final response = await http.post(
      Uri.parse('${baseUrl}token/refresh/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh': refreshToken}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final accessToken = data['access'];
      await SecureStorage.saveToken(accessToken, refreshToken);
      return true;
    }
    return false;
  }
}
