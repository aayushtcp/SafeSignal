import 'dart:convert';
import 'package:dmobile/pages/disaster_detail_page.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../utils/api_url.dart';

class DisasterListPage extends StatefulWidget {
  const DisasterListPage({super.key});

  @override
  State<DisasterListPage> createState() => _DisasterListPageState();
}

class _DisasterListPageState extends State<DisasterListPage> {
  List<dynamic> _disasters = [];

  @override
  void initState() {
    super.initState();
    fetchDisasters();
  }

  Future<void> fetchDisasters() async {
    final url = Uri.parse('${MyApi.apiurl}disaster-list/');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        setState(() {
          _disasters = decoded['data'];
        });
      } else {
        print('Failed to load data');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  Widget buildDisasterCard(dynamic disaster) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
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
        border: Border.all(color: const Color(0xFFB993F4).withOpacity(0.18)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: () {
            final id = disaster['id'];
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => DisasterDetailPage(disasterId: id),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFFB993F4).withOpacity(0.15),
                      child: Icon(Icons.warning_amber_rounded, color: Colors.purple[800], size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        disaster['disasterType']?.toString().toUpperCase() ?? 'UNKNOWN',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Color(0xFF4B006E),
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  disaster['description'] ?? 'No description',
                  style: const TextStyle(
                    color: Colors.black87,
                    fontSize: 15,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.location_on, color: Colors.green[700], size: 18),
                    const SizedBox(width: 4),
                    Text(
                      "Lat: ${disaster['latitude']}, Lng: ${disaster['longitude']}",
                      style: const TextStyle(fontSize: 13, color: Colors.black54),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.thumb_up_alt_rounded, color: Colors.purple[700], size: 18),
                    const SizedBox(width: 4),
                    Text(
                      "Upvotes: ${disaster['upvotes']}",
                      style: const TextStyle(fontSize: 13, color: Colors.black54),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () {
                        final id = disaster['id'];
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => DisasterDetailPage(disasterId: id),
                          ),
                        );
                      },
                      icon: const Icon(Icons.info_outline, size: 18),
                      label: const Text("Details"),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.purple[800],
                        side: BorderSide(color: Colors.purple[200]!),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // ElevatedButton.icon(
                    //   onPressed: () {
                    //     // Handle Upvote tap
                    //   },
                    //   icon: const Icon(Icons.thumb_up_alt_rounded, size: 18),
                    //   label: const Text("Upvote"),
                    //   style: ElevatedButton.styleFrom(
                    //     backgroundColor: const Color(0xFF10B981),
                    //     foregroundColor: Colors.white,
                    //     shape: RoundedRectangleBorder(
                    //       borderRadius: BorderRadius.circular(10),
                    //     ),
                    //     elevation: 2,
                    //   ),
                    // ),
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        title: const Text('Nearby Disasters'),
        // titleTextStyle: TextStyle(fontWeight: FontWeight.bold),
        centerTitle: true,
        backgroundColor: Colors.white,
        foregroundColor: Colors.purple,
        elevation: 2,
      ),
      body: _disasters.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _disasters.length,
              itemBuilder: (context, index) {
                return buildDisasterCard(_disasters[index]);
              },
            ),
    );
  }
}
