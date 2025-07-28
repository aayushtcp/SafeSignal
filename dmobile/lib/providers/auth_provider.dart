import 'package:flutter/material.dart';
import 'package:dmobile/api/api_service.dart';
import 'package:dmobile/utils/secure_storage.dart';
import 'package:http/http.dart' as http;
import '../utils/api_url.dart';
// import 'dart:convert';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;

  bool get isAuthenticated => _isAuthenticated;

  Future<void> checkAuthStatus() async {
    String? accessToken = await SecureStorage.getAccessToken();
    if (accessToken != null) {
      final response = await http.get(
        Uri.parse('${MyApi.apiurl}home/'),
        headers: {'Authorization': 'Bearer $accessToken'},
      );

      if (response.statusCode == 200) {
        _isAuthenticated = true;
      } else {
        await SecureStorage.deleteToken();
        _isAuthenticated = false;
      }
    } else {
      _isAuthenticated = false;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    var response = await ApiService.login(email, password);
    if (response != null) {
      _isAuthenticated = true;
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    await SecureStorage.deleteToken();
    _isAuthenticated = false;
    notifyListeners();
  }
}
