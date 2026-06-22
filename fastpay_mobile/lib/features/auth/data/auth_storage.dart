import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/auth_models.dart';
import 'device_key_service.dart';

class AuthStorage {
  AuthStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const _accessTokenKey = 'fastpay_access_token';
  static const _refreshTokenKey = 'fastpay_refresh_token';
  static const _refreshTokenBioKey = 'fastpay_refresh_token_bio';
  static const _userKey = 'fastpay_auth_user';
  static const _biometricLockKey = 'fastpay_biometric_lock';

  final FlutterSecureStorage _storage;

  Future<void> saveSession(
    AuthUser user,
    AuthTokens tokens, {
    bool biometricProtected = false,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: tokens.accessToken),
      biometricProtected
          ? _storage.write(
              key: _refreshTokenBioKey,
              value: tokens.refreshToken,
            )
          : _storage.write(key: _refreshTokenKey, value: tokens.refreshToken),
      _storage.write(key: _userKey, value: jsonEncode(user.toJson())),
    ]);

    if (biometricProtected) {
      await _storage.delete(key: _refreshTokenKey);
    } else {
      await _storage.delete(key: _refreshTokenBioKey);
    }
  }

  Future<String?> readAccessToken() => _storage.read(key: _accessTokenKey);

  Future<String?> readRefreshToken() async {
    final standard = await _storage.read(key: _refreshTokenKey);
    if (standard != null) return standard;
    return _storage.read(key: _refreshTokenBioKey);
  }

  Future<AuthUser?> readUser() async {
    final raw = await _storage.read(key: _userKey);
    if (raw == null) return null;

    try {
      return AuthUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> setBiometricLockEnabled(bool enabled) async {
    if (enabled) {
      await _storage.write(key: _biometricLockKey, value: '1');
    } else {
      await _storage.delete(key: _biometricLockKey);
    }
  }

  Future<bool> isBiometricLockEnabled() async {
    final value = await _storage.read(key: _biometricLockKey);
    return value == '1';
  }

  Future<void> saveDeviceKeyMaterial({
    required String deviceId,
    required String secretKey,
  }) async {
    await Future.wait([
      _storage.write(key: DeviceKeyService.deviceIdKey, value: deviceId),
      _storage.write(key: DeviceKeyService.deviceSecretKey, value: secretKey),
    ]);
  }

  Future<StoredDeviceKey?> readDeviceKeyMaterial() async {
    final deviceId = await _storage.read(key: DeviceKeyService.deviceIdKey);
    final secretKey = await _storage.read(key: DeviceKeyService.deviceSecretKey);

    if (deviceId == null || secretKey == null) {
      return null;
    }

    return StoredDeviceKey(deviceId: deviceId, secretKey: secretKey);
  }

  Future<void> clearDeviceKeyMaterial() async {
    await Future.wait([
      _storage.delete(key: DeviceKeyService.deviceIdKey),
      _storage.delete(key: DeviceKeyService.deviceSecretKey),
    ]);
  }

  Future<void> clear() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
      _storage.delete(key: _refreshTokenBioKey),
      _storage.delete(key: _userKey),
      _storage.delete(key: _biometricLockKey),
      _storage.delete(key: DeviceKeyService.deviceIdKey),
      _storage.delete(key: DeviceKeyService.deviceSecretKey),
    ]);
  }
}
