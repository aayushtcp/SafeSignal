import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import './firebase_api.dart';
import '../utils/api_url.dart';
import 'package:dmobile/utils/secure_storage.dart';

class ApiService {
  static const String baseUrl = MyApi.apiurl;
  static const String userUrl = MyApi.usersurl;
  // Login
  static Future<Map<String, dynamic>?> login(
      String username, String password) async {
    final response = await http.post(
      Uri.parse(
          '${userUrl}token/'), // Token endpoint to fetch the access and refresh tokens
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      // Use a logging framework instead of print
      // Example: log('User logged in successfully');
      final data = jsonDecode(response.body);
      final accessToken = data['access'];
      final refreshToken = data['refresh'];

      await SecureStorage.saveToken(accessToken, refreshToken);

      // Register FCM token after successful login
      final fcmToken = FirebaseApi.fcmToken;
      if (accessToken != null && fcmToken != null && fcmToken.isNotEmpty) {
        // Debug prints to verify tokens
        debugPrint('accessToken: $accessToken');
        debugPrint('fcmToken: $fcmToken');
        final fcmResponse = await http.post(
          Uri.parse('${baseUrl}register-fcm-token/'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
          body: jsonEncode({'fcmToken': fcmToken, 'device': 'mobile'}),
        );
        debugPrint('FCM token registration status: ${fcmResponse.statusCode}');
        debugPrint('FCM token registration response: ${fcmResponse.body}');
      }

      return data;
    } else {
      return null;
    }
  }

  // Register (if needed)
  static Future<bool> register(String username, String password) async {
    final response = await http.post(
      Uri.parse('${baseUrl}register/'), // Registration endpoint
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    return response.statusCode == 201;
  }

  // Logout
  static Future<void> logout() async {
    await SecureStorage
        .deleteToken(); // Deletes both tokens from secure storage
  }

  // Refresh Token
  static Future<bool> refreshAccessToken() async {
    String? refreshToken = await SecureStorage.getRefreshToken();
    if (refreshToken == null) return false;

    final response = await http.post(
      Uri.parse('${baseUrl}token/refresh/'), // Refresh token endpoint
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh': refreshToken}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await SecureStorage.saveToken(
          data['access'], refreshToken); // Save new access token
      return true;
    }
    return false;
  }
}
