import 'dart:convert';

class AuthUser {
  const AuthUser({
    required this.id,
    required this.fullName,
    this.phone,
    this.email,
    required this.kycLevel,
    required this.kycStatus,
    required this.biometricEnabled,
    required this.isActive,
  });

  final String id;
  final String fullName;
  final String? phone;
  final String? email;
  final int kycLevel;
  final String kycStatus;
  final bool biometricEnabled;
  final bool isActive;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      kycLevel: json['kycLevel'] as int? ?? 0,
      kycStatus: json['kycStatus'] as String? ?? 'pending',
      biometricEnabled: json['biometricEnabled'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'kycLevel': kycLevel,
        'kycStatus': kycStatus,
        'biometricEnabled': biometricEnabled,
        'isActive': isActive,
      };
}

class AuthTokens {
  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
  });

  final String accessToken;
  final String refreshToken;
  final String expiresIn;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresIn: json['expiresIn'] as String? ?? '15m',
    );
  }
}

class AuthSession {
  const AuthSession({required this.user, required this.tokens});

  final AuthUser user;
  final AuthTokens tokens;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
      tokens: AuthTokens.fromJson(json['tokens'] as Map<String, dynamic>),
    );
  }
}

bool isAccessTokenExpired(
  String accessToken, {
  Duration skew = const Duration(seconds: 30),
}) {
  try {
    final parts = accessToken.split('.');
    if (parts.length < 2) return true;

    final normalized = base64Url.normalize(parts[1]);
    final payload = utf8.decode(base64Url.decode(normalized));
    final json = jsonDecode(payload) as Map<String, dynamic>;
    final exp = json['exp'];

    if (exp is! num) return true;

    final expiry = DateTime.fromMillisecondsSinceEpoch(exp.toInt() * 1000);
    return DateTime.now().isAfter(expiry.subtract(skew));
  } catch (_) {
    return true;
  }
}
