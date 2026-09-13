class MyApi {
  // USB debugging via adb reverse (recommended, works without WiFi):
  // Run once per device connect: adb reverse tcp:8000 tcp:8000
  static const String apiurl = 'http://127.0.0.1:8000/api/';
  static const String usersurl = 'http://127.0.0.1:8000/users/';

  // Fallback WiFi (phone + host on same LAN, host wlo1 = 192.168.254.27, check `hostname -I`):
  // static const String apiurl = 'http://192.168.254.27:8000/api/';
  // static const String usersurl = 'http://192.168.254.27:8000/users/';

  // Legacy - college/home:
  // static const String apiurl = 'http://192.168.100.166:8000/api/';   //college
  // static const String usersurl = 'http://192.168.100.166:8000/users/';   //college
}
