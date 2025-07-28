import 'dart:convert';
import 'dart:io';
import 'package:dmobile/api/api_service.dart';
import 'package:dmobile/utils/secure_storage.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../utils/api_url.dart';

class DisasterRegisterPage extends StatefulWidget {
  const DisasterRegisterPage({super.key});

  @override
  _DisasterRegisterPageState createState() => _DisasterRegisterPageState();
}

class _DisasterRegisterPageState extends State<DisasterRegisterPage> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedDisasterType;
  String _description = '';
  double? _latitude;
  double? _longitude;
  String? _username;

  List<XFile?> _images = List<XFile?>.filled(4, null);
  final ImagePicker _picker = ImagePicker();

  final List<String> _disasterTypes = ['Earthquake', 'Flood', 'Fire', 'Storm'];

  @override
  void initState() {
    super.initState();
    _fetchUser();
    _requestLocationPermission().then((granted) {
      if (granted) _getCurrentLocation();
    });
  }

Future<void> _fetchUser() async {
  try {
    final token = await SecureStorage.getAccessToken();

    if (token == null) {
      debugPrint('No token found');
      setState(() => _username = 'guest');  // Or handle unauthenticated UI
      return;
    }

    final response = await http.get(
      Uri.parse('${MyApi.apiurl}home'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        _username = data['user'];
      });
    } else if (response.statusCode == 401) {
      // Try refreshing the token
      final refreshed = await ApiService.refreshAccessToken();
      if (refreshed) {
        return _fetchUser(); // Retry after refreshing
      } else {
        debugPrint('Token expired and refresh failed');
        setState(() => _username = 'guest');
      }
    } else {
      debugPrint('Fetch user failed: ${response.statusCode}');
      setState(() => _username = 'guest');
    }
  } catch (e) {
    debugPrint('Exception fetching user: $e');
    setState(() => _username = 'guest');
  }
}

  Future<bool> _requestLocationPermission() async {
    final status = await Permission.location.request();
    return status == PermissionStatus.granted;
  }

  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        permission = await Geolocator.requestPermission();
        if (permission != LocationPermission.whileInUse &&
            permission != LocationPermission.always) return;
      }

      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
      });
    } catch (e) {
      debugPrint('Location error: $e');
    }
  }

  Future<void> _pickImage(int index) async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _images[index] = image;
      });
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate() || _latitude == null || _longitude == null || _username == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields and allow location access')),
      );
      return;
    }

    _formKey.currentState!.save();

    var request = http.MultipartRequest(
      'POST',
      Uri.parse('${MyApi.apiurl}register-disaster/'),
    );

    request.fields['disasterType'] = _selectedDisasterType!;
    request.fields['description'] = _description;
    request.fields['latitude'] = _latitude.toString();
    request.fields['longitude'] = _longitude.toString();
    request.fields['triggeredBy'] = _username!;

    for (int i = 0; i < 4; i++) {
      if (_images[i] != null) {
        File file = File(_images[i]!.path);
        request.files.add(await http.MultipartFile.fromPath('image${i + 1}', file.path));
      }
    }

    try {
      var response = await request.send();

      if (response.statusCode == 201 || response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Disaster reported successfully')),
          );
          Navigator.pop(context);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to report disaster')),
          );
        }
      }
    } catch (e) {
      debugPrint('Submit error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error occurred while submitting')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool locationFailed = (_latitude == null || _longitude == null);

    return Scaffold(
      appBar: AppBar(title: const Text("Report Disaster")),
      body: _username == null
          ? const Center(child: CircularProgressIndicator())
          : locationFailed
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.location_off, size: 48, color: Colors.redAccent),
                      const SizedBox(height: 16),
                      const Text(
                        "Location permission denied or unavailable, or maybe your forgot to turn your location on!",
                        style: TextStyle(fontSize: 16, color: Colors.black54),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.refresh),
                        label: const Text("Retry Location"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF7C3AED),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
                        ),
                        onPressed: () async {
                          final granted = await _requestLocationPermission();
                          if (granted) {
                            await _getCurrentLocation();
                          }
                        },
                      ),
                    ],
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Form(
                    key: _formKey,
                    child: ListView(
                      children: [
                        DropdownButtonFormField<String>(
                          value: _selectedDisasterType,
                          items: _disasterTypes
                              .map((type) => DropdownMenuItem(
                                    value: type,
                                    child: Text(type),
                                  ))
                              .toList(),
                          onChanged: (value) => setState(() => _selectedDisasterType = value),
                          decoration: const InputDecoration(labelText: 'Disaster Type'),
                          validator: (value) => value == null ? 'Please select a disaster type' : null,
                        ),
                        TextFormField(
                          maxLines: 3,
                          decoration: const InputDecoration(labelText: 'Description'),
                          onSaved: (value) => _description = value ?? '',
                          validator: (value) => value == null || value.isEmpty ? 'Enter description' : null,
                        ),
                        TextFormField(
                          enabled: false,
                          initialValue: 'Lat: $_latitude, Lon: $_longitude',
                          decoration: const InputDecoration(labelText: 'Location'),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: List.generate(4, (index) {
                            return GestureDetector(
                              onTap: () => _pickImage(index),
                              child: Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: _images[index] != null
                                    ? Image.file(File(_images[index]!.path), fit: BoxFit.cover)
                                    : const Icon(Icons.add_a_photo),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _submitForm,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF7C3AED),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          child: const Text("Submit", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        )
                      ],
                    ),
                  ),
                ),
    );
  }
}
