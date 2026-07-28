import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/providers/auth_provider.dart';
import '../../kyc/data/kyc_repository.dart';

final kycRepositoryProvider = Provider<KycRepository>((ref) {
  return KycRepository(apiClient: ref.watch(apiClientProvider));
});

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  KycStatus? _status;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final status = await ref.read(kycRepositoryProvider).fetchStatus();
      if (mounted) {
        setState(() {
          _status = status;
          _loading = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = error.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _submitPlaceholder() async {
    setState(() => _loading = true);
    try {
      await ref.read(kycRepositoryProvider).submitDocument(
            documentType: 'id_card',
            idSubtype: 'national_id',
            fileName: 'placeholder.txt',
            contentBase64: 'cGxhY2Vob2xkZXI=',
          );
      await _load();
    } catch (error) {
      setState(() {
        _error = error.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: AppBar(title: const Text('KYC Verification')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Status for ${user?.fullName ?? 'your account'}',
                    style: const TextStyle(color: Color(0xFFA3A3A3)),
                  ),
                  const SizedBox(height: 16),
                  if (_error != null)
                    Text(_error!, style: const TextStyle(color: Colors.redAccent)),
                  if (_status != null) ...[
                    _Row(label: 'Level', value: '${_status!.level}'),
                    _Row(label: 'Status', value: _status!.status),
                    _Row(
                      label: 'Documents',
                      value: '${_status!.documentsSubmitted} submitted',
                    ),
                  ],
                  const Spacer(),
                  ElevatedButton(
                    onPressed: _loading ? null : _submitPlaceholder,
                    child: const Text('Submit placeholder ID document'),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () => context.pop(),
                    child: const Text('Back'),
                  ),
                ],
              ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF737373))),
          Text(value),
        ],
      ),
    );
  }
}
