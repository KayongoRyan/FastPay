import '../../../core/api/api_client.dart';
import '../models/auth_models.dart';
import 'auth_storage.dart';

class AuthRepository {
  AuthRepository({
    required ApiClient apiClient,
    required AuthStorage storage,
  })  : _api = apiClient,
        _storage = storage;

  final ApiClient _api;
  final AuthStorage _storage;

  Future<AuthSession> register({
    required String fullName,
    required String password,
    String? email,
    String? phone,
  }) async {
    final session = await _api.post(
      '/auth/register',
      body: {
        'fullName': fullName,
        'password': password,
        if (email != null && email.isNotEmpty) 'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      },
      parser: AuthSession.fromJson,
    );

    await _persist(session);
    return session;
  }

  Future<AuthSession> login({
    required String identifier,
    required String password,
  }) async {
    final session = await _api.post(
      '/auth/login',
      body: {
        'identifier': identifier,
        'password': password,
      },
      parser: AuthSession.fromJson,
    );

    await _persist(session);
    return session;
  }

  Future<AuthTokens> refresh(String refreshToken) async {
    final tokens = await _api.post(
      '/auth/refresh',
      body: {'refreshToken': refreshToken},
      parser: AuthTokens.fromJson,
    );

    _api.setAccessToken(tokens.accessToken);
    final user = await fetchMe();
    await _storage.saveSession(user, tokens);
    return tokens;
  }

  Future<AuthUser> fetchMe() async {
    return _api.get(
      '/auth/me',
      parser: AuthUser.fromJson,
      authenticated: true,
    );
  }

  Future<void> logout() async {
    try {
      await _api.post<Map<String, dynamic>>(
        '/auth/logout',
        body: {},
        parser: (json) => json,
        authenticated: true,
      );
    } finally {
      await _storage.clear();
      _api.setAccessToken(null);
    }
  }

  Future<AuthUser?> restoreSession() async {
    final accessToken = await _storage.readAccessToken();
    final refreshToken = await _storage.readRefreshToken();

    if (accessToken == null || refreshToken == null) {
      return null;
    }

    if (isAccessTokenExpired(accessToken)) {
      final tokens = await refresh(refreshToken);
      _api.setAccessToken(tokens.accessToken);
    } else {
      _api.setAccessToken(accessToken);
    }

    return fetchMe();
  }

  Future<void> _persist(AuthSession session) async {
    _api.setAccessToken(session.tokens.accessToken);
    await _storage.saveSession(session.user, session.tokens);
  }
}
