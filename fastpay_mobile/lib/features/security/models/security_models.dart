class SecuritySummary {
  SecuritySummary({
    required this.lastLogin,
    required this.activeSessions,
    required this.trustedDevices,
    required this.unreadAlerts,
    required this.accountFrozen,
  });

  final String? lastLogin;
  final int activeSessions;
  final int trustedDevices;
  final int unreadAlerts;
  final bool accountFrozen;

  factory SecuritySummary.fromJson(Map<String, dynamic> json) {
    return SecuritySummary(
      lastLogin: json['lastLogin'] as String?,
      activeSessions: json['activeSessions'] as int? ?? 0,
      trustedDevices: json['trustedDevices'] as int? ?? 0,
      unreadAlerts: json['unreadAlerts'] as int? ?? 0,
      accountFrozen: json['accountFrozen'] as bool? ?? false,
    );
  }
}

class SecuritySession {
  SecuritySession({
    required this.sessionId,
    required this.deviceLabel,
    required this.platform,
    required this.lastActiveAt,
    required this.current,
    this.ipAddress,
  });

  final String sessionId;
  final String deviceLabel;
  final String platform;
  final String? ipAddress;
  final String lastActiveAt;
  final bool current;

  factory SecuritySession.fromJson(Map<String, dynamic> json) {
    return SecuritySession(
      sessionId: json['sessionId'] as String,
      deviceLabel: json['deviceLabel'] as String? ?? 'Unknown',
      platform: json['platform'] as String? ?? 'unknown',
      ipAddress: json['ipAddress'] as String?,
      lastActiveAt: json['lastActiveAt'] as String,
      current: json['current'] as bool? ?? false,
    );
  }
}

class SecurityAlert {
  SecurityAlert({
    required this.id,
    required this.title,
    required this.body,
    required this.readAt,
  });

  final String id;
  final String title;
  final String body;
  final String? readAt;

  factory SecurityAlert.fromJson(Map<String, dynamic> json) {
    return SecurityAlert(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      readAt: json['readAt'] as String?,
    );
  }
}

class AuditEvent {
  AuditEvent({
    required this.id,
    required this.action,
    required this.createdAt,
  });

  final String id;
  final String action;
  final String? createdAt;

  factory AuditEvent.fromJson(Map<String, dynamic> json) {
    return AuditEvent(
      id: json['id'] as String,
      action: json['action'] as String,
      createdAt: json['createdAt'] as String?,
    );
  }
}
