class MyApi {
  // Active - USB via adb reverse (recommended, works without WiFi):
  // Run once per device connect: adb reverse tcp:8000 tcp:8000
  static const String apiurl = 'http://127.0.0.1:8000/api/';
  static const String usersurl = 'http://127.0.0.1:8000/users/';

  // Fallback WiFi (phone + host on same LAN, host wlo1 = 192.168.254.22, check `hostname -I`):
  // static const String apiurl = 'http://192.168.254.22:8000/api/';
  // static const String usersurl = 'http://192.168.254.22:8000/users/';

  // Legacy - college:
  // static const String apiurl = 'http://172.18.255.255/api/';
  // static const String usersurl = 'http://172.18.255.255/users/';
}
