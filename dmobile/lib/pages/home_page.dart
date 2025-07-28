import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:dmobile/utils/secure_storage.dart';
import '../utils/api_url.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _isAuthenticated = false;
  String _username = '';

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    String? accessToken = await SecureStorage.getAccessToken();
    if (accessToken != null) {
      await _fetchUserInfo(accessToken);
    } else {
      await SecureStorage.deleteToken();
      setState(() {
        _isAuthenticated = false;
        _username = '';
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed('/login_page');
      });
    }
  }

  Future<void> _fetchUserInfo(String accessToken) async {
    final response = await http.get(
      Uri.parse('${MyApi.apiurl}home/'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        _isAuthenticated = true;
        _username = data['user'];
      });
    } else {
      await SecureStorage.deleteToken();
      setState(() {
        _isAuthenticated = false;
        _username = '';
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed('/login_page');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('SafeSignal'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.purple,
        elevation: 0.5,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: 22,
          color: Color(0xFF7C3AED),
          letterSpacing: 1.2,
        ),
      ),
      body: Center(
        child: _isAuthenticated
            ? Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 400),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.purple.withOpacity(0.05),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: const Color(0xFFB993F4).withOpacity(0.15),
                        child: const Icon(Icons.verified_user, size: 44, color: Color(0xFF7C3AED)),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Welcome, $_username',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF4B006E),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Access disaster information and stay safe.',
                        style: TextStyle(
                          fontSize: 15,
                          color: Color(0xFF64748B),
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 28),
                      // --- New Button for Register Disaster ---
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pushNamed(context, '/disaster_register_screen');
                          },
                          icon: const Icon(Icons.add_location_alt_rounded, size: 20),
                          label: const Text(
                            'Report New Disaster',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 0,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Divider(
                        color: Colors.grey[200],
                        thickness: 1,
                        height: 1,
                      ),
                      const SizedBox(height: 28),
                      // --- Existing Buttons ---
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pushNamed(context, '/disaster_list_screen');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF7C3AED),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 0,
                          ),
                          child: const Text(
                            'View Disaster List',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      // SizedBox(
                      //   width: double.infinity,
                      //   child: OutlinedButton(
                      //     onPressed: () {
                      //       // Optionally add more navigation or actions here
                      //     },
                      //     style: OutlinedButton.styleFrom(
                      //       foregroundColor: const Color(0xFF10B981),
                      //       side: const BorderSide(color: Color(0xFF10B981), width: 1.2),
                      //       padding: const EdgeInsets.symmetric(vertical: 14),
                      //       shape: RoundedRectangleBorder(
                      //         borderRadius: BorderRadius.circular(10),
                      //       ),
                      //     ),
                      //     child: const Text(
                      //       'Profile & Settings',
                      //       style: TextStyle(
                      //         fontSize: 16,
                      //         fontWeight: FontWeight.w500,
                      //         letterSpacing: 0.5,
                      //       ),
                      //     ),
                      //   ),
                      // ),
                    ],
                  ),
                ),
              )
            : const CircularProgressIndicator(),
      ),
    );
  }
}
