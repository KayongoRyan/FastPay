import 'dart:io';

/// Backend API base URL.
///
/// Override at run time:
/// `flutter run --dart-define=API_URL=http://192.168.1.10:3000`
class ApiConfig {
  static const String _defineUrl = String.fromEnvironment('API_URL');

  static String get baseUrl {
    if (_defineUrl.isNotEmpty) {
      return _normalize(_defineUrl);
    }

    // Android emulator maps host localhost to 10.0.2.2
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    }

    return 'http://localhost:3000';
  }

  static String _normalize(String url) {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }
}
