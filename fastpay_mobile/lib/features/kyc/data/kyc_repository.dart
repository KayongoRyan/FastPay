import '../../../core/api/api_client.dart';

class KycStatus {
  const KycStatus({
    required this.level,
    required this.status,
    required this.documentsSubmitted,
  });

  final int level;
  final String status;
  final int documentsSubmitted;

  factory KycStatus.fromJson(Map<String, dynamic> json) {
    return KycStatus(
      level: json['level'] as int? ?? 0,
      status: json['status'] as String? ?? 'pending',
      documentsSubmitted: json['documentsSubmitted'] as int? ?? 0,
    );
  }
}

class KycRepository {
  KycRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  Future<KycStatus> fetchStatus() {
    return _api.get(
      '/kyc/status',
      authenticated: true,
      parser: KycStatus.fromJson,
    );
  }

  Future<void> submitDocument({
    required String documentType,
    required String idSubtype,
    required String fileName,
    required String contentBase64,
  }) {
    return _api.postVoid(
      '/kyc/documents',
      authenticated: true,
      body: {
        'documentType': documentType,
        'idSubtype': idSubtype,
        'fileName': fileName,
        'contentBase64': contentBase64,
      },
    );
  }
}
