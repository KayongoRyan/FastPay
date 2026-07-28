import '../../../core/api/api_client.dart';

class RelayResponse {
  const RelayResponse({
    required this.accepted,
    required this.queueId,
    required this.estimatedSeconds,
    this.txHash,
  });

  final bool accepted;
  final String queueId;
  final int estimatedSeconds;
  final String? txHash;

  factory RelayResponse.fromJson(Map<String, dynamic> json) {
    return RelayResponse(
      accepted: json['accepted'] as bool? ?? false,
      queueId: json['queueId'] as String? ?? '',
      estimatedSeconds: json['estimatedSeconds'] as int? ?? 0,
      txHash: json['txHash'] as String?,
    );
  }
}

class RelayStatus {
  const RelayStatus({
    required this.txHash,
    required this.status,
    required this.retryCount,
    this.lastError,
    this.onChainTxHash,
  });

  final String txHash;
  final String status;
  final int retryCount;
  final String? lastError;
  final String? onChainTxHash;

  factory RelayStatus.fromJson(Map<String, dynamic> json) {
    return RelayStatus(
      txHash: json['txHash'] as String? ?? '',
      status: json['status'] as String? ?? 'queued',
      retryCount: json['retryCount'] as int? ?? 0,
      lastError: json['lastError'] as String?,
      onChainTxHash: json['onChainTxHash'] as String?,
    );
  }
}

class OfflineRelayRepository {
  OfflineRelayRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  Future<RelayResponse> submit({
    required String signedTxXdr,
    String? recipientPhone,
  }) {
    return _api.post(
      '/offline/relay',
      authenticated: true,
      body: {
        'signedTxXDR': signedTxXdr,
        if (recipientPhone != null) 'recipientPhone': recipientPhone,
      },
      parser: RelayResponse.fromJson,
    );
  }

  Future<RelayStatus> status(String txHash) {
    return _api.get(
      '/offline/relay/$txHash',
      authenticated: true,
      parser: RelayStatus.fromJson,
    );
  }

  Future<RelayStatus> pollUntilConfirmed(
    String txHash, {
    int maxAttempts = 30,
    Duration interval = const Duration(milliseconds: 1500),
  }) async {
    for (var i = 0; i < maxAttempts; i++) {
      final status = await this.status(txHash);
      if (status.status == 'confirmed') return status;
      if (status.status == 'failed') {
        throw StateError(status.lastError ?? 'Relay failed');
      }
      await Future<void>.delayed(interval);
    }
    throw StateError('Relay confirmation timed out');
  }
}
