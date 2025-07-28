import 'package:dmobile/api/firebase_api.dart';
import 'package:dmobile/firebase_options.dart';
import 'package:dmobile/pages/disaster_list_page.dart';
import 'package:dmobile/pages/disaster_register_page.dart';
import 'package:dmobile/pages/home_page.dart';
import 'package:dmobile/pages/login_page.dart';
import 'package:dmobile/pages/notification_page.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dmobile/providers/auth_provider.dart';

final navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await FirebaseApi().initNotifications();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AuthProvider()..checkAuthStatus(),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        navigatorKey: navigatorKey,
        routes: {
          '/notification_screen': (context) => const NotificationPage(),
          '/disaster_list_screen': (context) => const DisasterListPage(),
          '/disaster_register_screen': (context) => const DisasterRegisterPage(),
        },
        home: Consumer<AuthProvider>(
          builder: (context, authProvider, child) {
            // Conditional routing based on authentication status
            if (authProvider.isAuthenticated) {
              return const HomePage();
            } else {
              return LoginPage();
            }
          },
        ),
      ),
    );
  }
}
