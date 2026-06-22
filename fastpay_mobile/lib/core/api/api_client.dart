import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../config/api_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({http.Client? httpClient}) : _http = httpClient ?? http.Client();

  final http.Client _http;
  String? _accessToken;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  String? get accessToken => _accessToken;

  Future<T> get<T>(
    String path, {
    required T Function(Map<String, dynamic> json) parser,
    bool authenticated = false,
  }) async {
    final response = await _http.get(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers(authenticated),
    );
    return _parse(response, parser);
  }

  Future<T> post<T>(
    String path, {
    Map<String, dynamic>? body,
    required T Function(Map<String, dynamic> json) parser,
    bool authenticated = false,
  }) async {
    final response = await _http.post(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: _headers(authenticated),
      body: body == null ? null : jsonEncode(body),
    );
    return _parse(response, parser);
  }

  Map<String, String> _headers(bool authenticated) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (authenticated && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }

    return headers;
  }

  T _parse<T>(
    http.Response response,
    T Function(Map<String, dynamic> json) parser,
  ) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        return parser(decoded);
      }
      throw ApiException('Unexpected response shape');
    }

    throw ApiException(_extractError(response), statusCode: response.statusCode);
  }

  String _extractError(http.Response response) {
    try {
      final body = jsonDecode(response.body);
      if (body is Map<String, dynamic>) {
        final message = body['message'];
        if (message is String) return message;
        if (message is List) return message.join(', ');
      }
    } catch (_) {
      // fall through
    }

    if (response.body.isNotEmpty) {
      return response.body;
    }

    return 'Request failed (${response.statusCode})';
  }
}
