import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/offline_relay_repository.dart';
import '../models/offline_qr_payload.dart';

final offlineRelayRepositoryProvider = Provider<OfflineRelayRepository>((ref) {
  return OfflineRelayRepository(apiClient: ref.watch(apiClientProvider));
});

class OfflineReceiveScreen extends ConsumerStatefulWidget {
  const OfflineReceiveScreen({super.key});

  @override
  ConsumerState<OfflineReceiveScreen> createState() =>
      _OfflineReceiveScreenState();
}

class _OfflineReceiveScreenState extends ConsumerState<OfflineReceiveScreen> {
  final _manualController = TextEditingController();
  bool _scanning = true;
  bool _busy = false;
  String? _result;
  String? _error;

  @override
  void dispose() {
    _manualController.dispose();
    super.dispose();
  }

  Future<void> _relay(String raw) async {
    setState(() {
      _busy = true;
      _error = null;
      _result = null;
    });

    try {
      final payload = OfflineQrPayload.decode(raw);
      final repo = ref.read(offlineRelayRepositoryProvider);
      final accepted = await repo.submit(
        signedTxXdr: payload.signedTxXdr,
        recipientPhone: payload.recipientPhone,
      );

      if (accepted.txHash == null || accepted.txHash!.isEmpty) {
        setState(() {
          _scanning = false;
          _result = 'Queued ${accepted.queueId} (~${accepted.estimatedSeconds}s)';
        });
        return;
      }

      final status = await repo.pollUntilConfirmed(accepted.txHash!);
      setState(() {
        _scanning = false;
        _result =
            'Confirmed ${status.txHash} · on-chain ${status.onChainTxHash ?? 'pending'}';
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
        _scanning = false;
      });
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Offline Receive')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Scan a signed transaction QR and relay when online.',
              style: TextStyle(color: Color(0xFFA3A3A3)),
            ),
            const SizedBox(height: 16),
            if (_scanning && !_busy)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 280,
                  child: MobileScanner(
                    onDetect: (capture) {
                      if (!_scanning || _busy) return;
                      final barcodes = capture.barcodes;
                      if (barcodes.isEmpty) return;
                      final value = barcodes.first.rawValue;
                      if (value != null && value.isNotEmpty) {
                        _relay(value);
                      }
                    },
                  ),
                ),
              )
            else if (!_scanning)
              OutlinedButton(
                onPressed: _busy
                    ? null
                    : () => setState(() {
                          _scanning = true;
                          _result = null;
                          _error = null;
                        }),
                child: const Text('Scan another QR'),
              ),
            const SizedBox(height: 16),
            TextField(
              controller: _manualController,
              decoration: const InputDecoration(
                labelText: 'Or paste QR JSON manually',
                alignLabelWithHint: true,
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _busy || _manualController.text.trim().isEmpty
                  ? null
                  : () => _relay(_manualController.text.trim()),
              child: _busy
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Relay pasted payload'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: Colors.redAccent)),
            ],
            if (_result != null) ...[
              const SizedBox(height: 12),
              Text(_result!, style: const TextStyle(color: Color(0xFF4ADE80))),
            ],
          ],
        ),
      ),
    );
  }
}
