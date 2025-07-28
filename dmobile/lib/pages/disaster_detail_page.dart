import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../utils/api_url.dart';

class DisasterDetailPage extends StatefulWidget {
  final int disasterId;

  const DisasterDetailPage({super.key, required this.disasterId});

  @override
  State<DisasterDetailPage> createState() => _DisasterDetailPageState();
}

class _DisasterDetailPageState extends State<DisasterDetailPage> {
  Map<String, dynamic>? disasterData;
  LatLng? userLocation;
  List<LatLng> routePoints = [];

  @override
  void initState() {
    super.initState();
    fetchDisasterDetail();
  }

  Future<void> fetchDisasterDetail() async {
    final url = Uri.parse(
        '${MyApi.apiurl}disaster-detail/${widget.disasterId}/');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        setState(() {
          disasterData = json.decode(response.body);
        });
      } else {
        print('Failed to load disaster detail');
      }
    } catch (e) {
      print('Error fetching detail: $e');
    }
  }

  Future<void> getUserLocationAndRoute(double destLat, double destLng) async {
    // Get user location
    Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
    userLocation = LatLng(position.latitude, position.longitude);

    // Fetch route from OpenRouteService (replace YOUR_API_KEY)
    final url =
        'https://api.openrouteservice.org/v2/directions/driving-car?api_key=YOUR_API_KEY&start=${userLocation!.longitude},${userLocation!.latitude}&end=$destLng,$destLat';
    final response = await http.get(Uri.parse(url));
    final data = json.decode(response.body);

    // Decode polyline
    final coords = data['features'][0]['geometry']['coordinates'] as List;
    routePoints = coords.map((c) => LatLng(c[1], c[0])).toList();

    setState(() {});
  }

  Widget buildMapSection(double? latitude, double? longitude) {
    if (latitude == null || longitude == null) {
      return const Center(child: Text('Location data not available'));
    }
    return SizedBox(
      height: 300,
      child: FlutterMap(
        options: MapOptions(
          center: LatLng(latitude, longitude),
          zoom: 13.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c'],
            userAgentPackageName: 'com.example.app',
          ),
          MarkerLayer(
            markers: [
              Marker(
                width: 40,
                height: 40,
                point: LatLng(latitude, longitude),
                child: const Icon(Icons.location_on, color: Colors.red, size: 40),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Colors.black87),
        title: Text(
          'Disaster Detail',
          style: GoogleFonts.inter(
              fontSize: 20, fontWeight: FontWeight.w600, color: Colors.black87),
        ),
      ),
      body: disasterData == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    constraints: const BoxConstraints(maxWidth: 500),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black12.withOpacity(0.1),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Text(
                            disasterData!['disasterType']?.toUpperCase() ?? 'UNKNOWN',
                            style: GoogleFonts.inter(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Colors.redAccent,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Divider(color: Colors.grey[300], thickness: 1),
                        const SizedBox(height: 10),
                        InfoItem(label: 'Description', value: disasterData!['description']),
                        InfoItem(label: 'Latitude', value: '${disasterData!['latitude']}'),
                        InfoItem(label: 'Longitude', value: '${disasterData!['longitude']}'),
                        InfoItem(label: 'Country', value: disasterData!['country']),
                        InfoItem(label: 'Continent', value: disasterData!['continent']),
                        InfoItem(label: 'Upvotes', value: '${disasterData!['upvotes']}'),
                        const SizedBox(height: 20),
                        buildMapSection(
                          double.tryParse('${disasterData?['latitude']}'),
                          double.tryParse('${disasterData?['longitude']}')
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color.fromARGB(255, 2, 209, 109),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          child: Center(
                            child: Text(
                              'Upvote',
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
    );
  }
}

class InfoItem extends StatelessWidget {
  final String label;
  final String? value;

  const InfoItem({super.key, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "$label: ",
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
              color: Colors.black87,
              fontSize: 16,
            ),
          ),
          Expanded(
            child: Text(
              value ?? 'N/A',
              style: GoogleFonts.inter(
                color: Colors.grey[700],
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}