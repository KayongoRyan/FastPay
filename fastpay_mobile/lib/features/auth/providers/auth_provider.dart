import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../models/auth_models.dart';
import '../data/auth_repository.dart';
import '../data/auth_storage.dart';
import '../data/biometric_service.dart';
import '../data/device_key_service.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authStorageProvider = Provider<AuthStorage>((ref) => AuthStorage());

final biometricServiceProvider = Provider<BiometricService>((ref) {
  return BiometricService();
});

final deviceKeyServiceProvider = Provider<DeviceKeyService>((ref) {
  return DeviceKeyService();
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.watch(apiClientProvider),
    storage: ref.watch(authStorageProvider),
  );
});

class AuthState {
  const AuthState({
    this.user,
    this.isReady = false,
    this.isLoading = false,
    this.isLocked = false,
    this.biometricLabel = 'Biometrics',
    this.error,
  });

  final AuthUser? user;
  final bool isReady;
  final bool isLoading;
  final bool isLocked;
  final String biometricLabel;
  final String? error;

  bool get isAuthenticated => user != null && !isLocked;

  AuthState copyWith({
    AuthUser? user,
    bool? isReady,
    bool? isLoading,
    bool? isLocked,
    String? biometricLabel,
    String? error,
    bool clearUser = false,
    bool clearError = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isReady: isReady ?? this.isReady,
      isLoading: isLoading ?? this.isLoading,
      isLocked: isLocked ?? this.isLocked,
      biometricLabel: biometricLabel ?? this.biometricLabel,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    Future.microtask(initialize);
    return const AuthState(isLoading: true);
  }

  AuthRepository get _repo => ref.read(authRepositoryProvider);
  BiometricService get _biometric => ref.read(biometricServiceProvider);
  DeviceKeyService get _deviceKeys => ref.read(deviceKeyServiceProvider);

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final capability = await _biometric.getCapability();
      final storedUser = await _repo.readStoredUser();
      final biometricLock = await _repo.isBiometricLockEnabled();

      if (biometricLock && (storedUser?.biometricEnabled ?? false)) {
        state = AuthState(
          user: storedUser,
          isLocked: true,
          isReady: true,
          biometricLabel: capability.label,
        );
        return;
      }

      final user = await _repo.restoreSession();
      state = AuthState(
        user: user,
        isReady: true,
        biometricLabel: capability.label,
      );
    } catch (_) {
      await ref.read(authStorageProvider).clear();
      ref.read(apiClientProvider).setAccessToken(null);
      state = const AuthState(isReady: true);
    }
  }

  Future<void> login({
    required String identifier,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final session = await _repo.login(
        identifier: identifier,
        password: password,
      );
      state = AuthState(
        user: session.user,
        isReady: true,
        biometricLabel: state.biometricLabel,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        isReady: true,
        error: error.toString(),
      );
      rethrow;
    }
  }

  Future<void> register({
    required String fullName,
    required String password,
    String? email,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final session = await _repo.register(
        fullName: fullName,
        password: password,
        email: email,
        phone: phone,
      );
      state = AuthState(
        user: session.user,
        isReady: true,
        biometricLabel: state.biometricLabel,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        isReady: true,
        error: error.toString(),
      );
      rethrow;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      await _repo.logout();
    } finally {
      state = AuthState(isReady: true, biometricLabel: state.biometricLabel);
    }
  }

  Future<void> unlockWithBiometric() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final authenticated = await _biometric.authenticate('Unlock FastPay');
      if (!authenticated) {
        state = state.copyWith(
          isLoading: false,
          error: 'Biometric authentication cancelled',
        );
        return;
      }

      final deviceKey = await _repo.readDeviceKeyMaterial();
      if (deviceKey == null) {
        throw StateError('Biometric device key not found');
      }

      final challenge = await _repo.fetchBiometricChallenge(deviceKey.deviceId);
      final signature = await _deviceKeys.signChallenge(
        deviceKey.secretKey,
        challenge.challenge,
      );

      final session = await _repo.biometricLogin(
        deviceId: deviceKey.deviceId,
        signature: signature,
      );

      state = AuthState(
        user: session.user,
        isReady: true,
        biometricLabel: state.biometricLabel,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
      );
      rethrow;
    }
  }

  Future<void> enableBiometric() async {
    final user = state.user;
    if (user == null) {
      throw StateError('Sign in before enabling biometrics');
    }

    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final capability = await _biometric.getCapability();
      if (!capability.available || !capability.enrolled) {
        throw StateError('${capability.label} is not available on this device');
      }

      final authenticated = await _biometric.authenticate(
        'Enable ${capability.label}',
      );
      if (!authenticated) {
        state = state.copyWith(
          isLoading: false,
          error: 'Biometric authentication cancelled',
        );
        return;
      }

      final deviceKey = await _deviceKeys.generate();
      await _repo.saveDeviceKeyMaterial(deviceKey);

      final updatedUser = await _repo.enrollBiometric(
        enabled: true,
        deviceId: deviceKey.deviceId,
        publicKey: deviceKey.publicKey,
      );

      final refreshToken = await ref.read(authStorageProvider).readRefreshToken();
      if (refreshToken == null) {
        throw StateError('Missing refresh token');
      }

      final accessToken = await ref.read(authStorageProvider).readAccessToken();
      if (accessToken == null) {
        throw StateError('Missing access token');
      }

      await ref.read(authStorageProvider).saveSession(
            updatedUser,
            AuthTokens(
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresIn: '15m',
            ),
            biometricProtected: true,
          );

      await _repo.setBiometricLockEnabled(true);

      state = state.copyWith(
        user: updatedUser,
        isLoading: false,
        biometricLabel: capability.label,
      );
    } catch (error) {
      await _repo.clearDeviceKeyMaterial();
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
      );
      rethrow;
    }
  }

  Future<void> disableBiometric() async {
    final user = state.user;
    if (user == null) {
      return;
    }

    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final updatedUser = await _repo.enrollBiometric(enabled: false);
      final refreshToken = await ref.read(authStorageProvider).readRefreshToken();
      final accessToken = await ref.read(authStorageProvider).readAccessToken();

      if (refreshToken == null || accessToken == null) {
        throw StateError('Missing session tokens');
      }

      await ref.read(authStorageProvider).saveSession(
            updatedUser,
            AuthTokens(
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresIn: '15m',
            ),
          );

      await _repo.clearDeviceKeyMaterial();
      await _repo.setBiometricLockEnabled(false);

      state = state.copyWith(
        user: updatedUser,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: error.toString(),
      );
      rethrow;
    }
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
