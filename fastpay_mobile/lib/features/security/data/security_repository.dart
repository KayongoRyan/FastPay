import '../../../core/api/api_client.dart';
import '../models/security_models.dart';

class SecurityRepository {
  SecurityRepository(this._api);

  final ApiClient _api;

  Future<SecuritySummary> fetchSummary() {
    return _api.get(
      '/security/summary',
      authenticated: true,
      parser: SecuritySummary.fromJson,
    );
  }

  Future<List<SecuritySession>> fetchSessions() async {
    final result = await _api.get<Map<String, dynamic>>(
      '/security/sessions',
      authenticated: true,
      parser: (json) => json,
    );
    final sessions = result['sessions'] as List<dynamic>? ?? [];
    return sessions
        .map((e) => SecuritySession.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<SecurityAlert>> fetchAlerts() async {
    final result = await _api.get<Map<String, dynamic>>(
      '/security/alerts',
      authenticated: true,
      parser: (json) => json,
    );
    final alerts = result['alerts'] as List<dynamic>? ?? [];
    return alerts
        .map((e) => SecurityAlert.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<AuditEvent>> fetchEvents() async {
    final result = await _api.get<Map<String, dynamic>>(
      '/audit/events',
      authenticated: true,
      parser: (json) => json,
    );
    final events = result['events'] as List<dynamic>? ?? [];
    return events
        .map((e) => AuditEvent.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> revokeSession(String sessionId) {
    return _api.delete('/security/sessions/$sessionId', authenticated: true);
  }

  Future<void> revokeOtherSessions() {
    return _api.delete('/security/sessions', authenticated: true);
  }

  Future<void> freezeAccount() async {
    await _api.post<Map<String, dynamic>>(
      '/auth/freeze-account',
      body: {},
      authenticated: true,
      parser: (json) => json,
    );
  }
}
