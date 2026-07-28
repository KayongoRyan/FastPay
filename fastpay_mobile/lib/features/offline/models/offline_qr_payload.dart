import 'dart:convert';

class OfflineQrPayload {
  const OfflineQrPayload({
    required this.signedTxXdr,
    this.recipientPhone,
  });

  final String signedTxXdr;
  final String? recipientPhone;

  Map<String, dynamic> toJson() => {
        'v': 1,
        'signedTxXDR': signedTxXdr,
        if (recipientPhone != null) 'recipientPhone': recipientPhone,
      };

  String encode() => jsonEncode(toJson());

  static OfflineQrPayload decode(String raw) {
    final trimmed = raw.trim();
    final dynamic parsed = jsonDecode(trimmed);
    if (parsed is! Map<String, dynamic>) {
      throw FormatException('Invalid offline QR payload');
    }

    final xdr = parsed['signedTxXDR'] as String? ??
        parsed['signedTxXdr'] as String?;
    if (xdr == null || xdr.isEmpty) {
      throw FormatException('Missing signedTxXDR');
    }

    return OfflineQrPayload(
      signedTxXdr: xdr,
      recipientPhone: parsed['recipientPhone'] as String?,
    );
  }
}
