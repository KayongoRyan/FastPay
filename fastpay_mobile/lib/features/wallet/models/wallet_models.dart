class WalletMe {
  const WalletMe({
    required this.id,
    required this.accountNumber,
    required this.publicKey,
    required this.balance,
    required this.currency,
    required this.balances,
    required this.xlmBalance,
  });

  final String id;
  final String accountNumber;
  final String publicKey;
  final num balance;
  final String currency;
  final Map<String, String> balances;
  final num xlmBalance;

  factory WalletMe.fromJson(Map<String, dynamic> json) {
    final balancesRaw = json['balances'];
    final balances = <String, String>{};
    if (balancesRaw is Map) {
      balancesRaw.forEach((key, value) {
        balances['$key'] = '$value';
      });
    }

    return WalletMe(
      id: json['id'] as String? ?? '',
      accountNumber: json['accountNumber'] as String? ?? '',
      publicKey: json['publicKey'] as String? ?? '',
      balance: json['balance'] as num? ?? 0,
      currency: json['currency'] as String? ?? 'RWF',
      balances: balances,
      xlmBalance: json['xlmBalance'] as num? ?? 0,
    );
  }
}

class WalletHistoryItem {
  const WalletHistoryItem({
    required this.id,
    required this.txHash,
    required this.status,
    required this.amount,
    required this.asset,
    required this.direction,
    required this.counterparty,
    required this.createdAt,
  });

  final String id;
  final String txHash;
  final String status;
  final String amount;
  final String asset;
  final String direction;
  final String counterparty;
  final DateTime createdAt;

  factory WalletHistoryItem.fromJson(Map<String, dynamic> json) {
    return WalletHistoryItem(
      id: json['id'] as String? ?? '',
      txHash: json['txHash'] as String? ?? '',
      status: json['status'] as String? ?? '',
      amount: json['amount'] as String? ?? '0',
      asset: json['asset'] as String? ?? 'XLM',
      direction: json['direction'] as String? ?? 'out',
      counterparty: json['counterparty'] as String? ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class TransferResult {
  const TransferResult({
    required this.txHash,
    required this.queueId,
    required this.estimatedSeconds,
    required this.amountRwf,
    required this.destination,
  });

  final String txHash;
  final String queueId;
  final int estimatedSeconds;
  final num amountRwf;
  final String destination;

  factory TransferResult.fromJson(Map<String, dynamic> json) {
    return TransferResult(
      txHash: json['txHash'] as String? ?? '',
      queueId: json['queueId'] as String? ?? '',
      estimatedSeconds: json['estimatedSeconds'] as int? ?? 0,
      amountRwf: json['amountRwf'] as num? ?? 0,
      destination: json['destination'] as String? ?? '',
    );
  }
}
