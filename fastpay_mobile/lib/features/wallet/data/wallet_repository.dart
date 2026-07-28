import '../../../core/api/api_client.dart';
import '../models/wallet_models.dart';

class WalletRepository {
  WalletRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  Future<WalletMe> fetchWallet() {
    return _api.get(
      '/wallet/me',
      authenticated: true,
      parser: WalletMe.fromJson,
    );
  }

  Future<List<WalletHistoryItem>> fetchHistory() {
    return _api.getList(
      '/wallet/me/history',
      authenticated: true,
      parser: WalletHistoryItem.fromJson,
    );
  }

  Future<TransferResult> transfer({
    required String destination,
    required int amountRwf,
    String? memo,
  }) {
    return _api.post(
      '/wallet/me/transfer',
      authenticated: true,
      body: {
        'destination': destination,
        'amountRwf': amountRwf,
        if (memo != null && memo.isNotEmpty) 'memo': memo,
      },
      parser: TransferResult.fromJson,
    );
  }

  Future<WalletMe> provision() {
    return _api.post(
      '/wallet/provision',
      authenticated: true,
      body: {},
      parser: WalletMe.fromJson,
    );
  }
}
