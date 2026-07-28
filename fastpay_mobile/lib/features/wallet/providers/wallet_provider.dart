import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/wallet_repository.dart';
import '../models/wallet_models.dart';

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepository(apiClient: ref.watch(apiClientProvider));
});

class WalletState {
  const WalletState({
    this.wallet,
    this.history = const [],
    this.loading = false,
    this.error,
  });

  final WalletMe? wallet;
  final List<WalletHistoryItem> history;
  final bool loading;
  final String? error;

  WalletState copyWith({
    WalletMe? wallet,
    List<WalletHistoryItem>? history,
    bool? loading,
    String? error,
    bool clearError = false,
  }) {
    return WalletState(
      wallet: wallet ?? this.wallet,
      history: history ?? this.history,
      loading: loading ?? this.loading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class WalletNotifier extends Notifier<WalletState> {
  @override
  WalletState build() {
    return const WalletState();
  }

  WalletRepository get _repo => ref.read(walletRepositoryProvider);

  Future<void> refresh() async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final results = await Future.wait([
        _repo.fetchWallet(),
        _repo.fetchHistory(),
      ]);
      state = WalletState(
        wallet: results[0] as WalletMe,
        history: results[1] as List<WalletHistoryItem>,
      );
    } catch (error) {
      state = state.copyWith(
        loading: false,
        error: error.toString(),
      );
    }
  }

  Future<void> provision() async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final wallet = await _repo.provision();
      state = state.copyWith(wallet: wallet, loading: false);
      await refresh();
    } catch (error) {
      state = state.copyWith(
        loading: false,
        error: error.toString(),
      );
      rethrow;
    }
  }

  Future<TransferResult> transfer({
    required String destination,
    required int amountRwf,
    String? memo,
  }) async {
    final result = await _repo.transfer(
      destination: destination,
      amountRwf: amountRwf,
      memo: memo,
    );
    await refresh();
    return result;
  }
}

final walletProvider = NotifierProvider<WalletNotifier, WalletState>(
  WalletNotifier.new,
);
