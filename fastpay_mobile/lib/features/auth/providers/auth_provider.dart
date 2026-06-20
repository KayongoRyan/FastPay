import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../models/auth_models.dart';
import '../data/auth_repository.dart';
import '../data/auth_storage.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authStorageProvider = Provider<AuthStorage>((ref) => AuthStorage());

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
    this.error,
  });

  final AuthUser? user;
  final bool isReady;
  final bool isLoading;
  final String? error;

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    AuthUser? user,
    bool? isReady,
    bool? isLoading,
    String? error,
    bool clearUser = false,
    bool clearError = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isReady: isReady ?? this.isReady,
      isLoading: isLoading ?? this.isLoading,
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

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final user = await _repo.restoreSession();
      state = AuthState(user: user, isReady: true);
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
      state = AuthState(user: session.user, isReady: true);
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
      state = AuthState(user: session.user, isReady: true);
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
      state = const AuthState(isReady: true);
    }
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
