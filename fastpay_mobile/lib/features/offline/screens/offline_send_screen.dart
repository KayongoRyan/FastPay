import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../wallet/providers/wallet_provider.dart';

class OfflineSendScreen extends ConsumerStatefulWidget {
  const OfflineSendScreen({super.key});

  @override
  ConsumerState<OfflineSendScreen> createState() => _OfflineSendScreenState();
}

class _OfflineSendScreenState extends ConsumerState<OfflineSendScreen> {
  final _destinationController = TextEditingController();
  final _amountController = TextEditingController(text: '1000');
  final _phoneController = TextEditingController();
  String? _qrPayload;
  String? _result;
  String? _error;
  bool _busy = false;

  @override
  void dispose() {
    _destinationController.dispose();
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _sendAndRelay() async {
    setState(() {
      _busy = true;
      _error = null;
      _result = null;
    });

    try {
      final amount = int.tryParse(_amountController.text.trim()) ?? 0;
      if (amount < 100) throw StateError('Minimum amount is RWF 100');

      final transfer = await ref.read(walletProvider.notifier).transfer(
            destination: _destinationController.text.trim(),
            amountRwf: amount,
            memo: _phoneController.text.trim().isEmpty
                ? null
                : 'phone:${_phoneController.text.trim()}',
          );

      setState(() {
        _result =
            'Relay queued ${transfer.queueId} (~${transfer.estimatedSeconds}s) · ${transfer.txHash}';
        _qrPayload = null;
      });
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final wallet = ref.watch(walletProvider).wallet;

    return Scaffold(
      appBar: AppBar(title: const Text('Send & Relay')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Send via wallet API (server signs and relays). '
              'Share QR from Expo for true offline-signed payloads.',
              style: TextStyle(color: Color(0xFFA3A3A3)),
            ),
            if (wallet != null) ...[
              const SizedBox(height: 8),
              Text('From ${wallet.accountNumber} · RWF ${wallet.balance}'),
            ],
            const SizedBox(height: 16),
            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(
                labelText: 'Destination (G… or account #)',
              ),
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              decoration: const InputDecoration(labelText: 'Amount (RWF)'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Recipient phone (optional)',
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _busy || wallet == null ? null : _sendAndRelay,
              child: _busy
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Send & relay'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: Colors.redAccent)),
            ],
            if (_result != null) ...[
              const SizedBox(height: 12),
              Text(_result!, style: const TextStyle(color: Color(0xFF4ADE80))),
            ],
            if (_qrPayload != null) ...[
              const SizedBox(height: 24),
              Center(
                child: QrImageView(
                  data: _qrPayload!,
                  size: 220,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
