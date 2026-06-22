import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

/// Scan signed offline payment QR and relay when online.
class OfflineReceiveScreen extends StatefulWidget {
  const OfflineReceiveScreen({super.key});

  @override
  State<OfflineReceiveScreen> createState() => _OfflineReceiveScreenState();
}

class _OfflineReceiveScreenState extends State<OfflineReceiveScreen> {
  final _manualController = TextEditingController();
  bool _scanning = true;
  String? _result;

  @override
  void dispose() {
    _manualController.dispose();
    super.dispose();
  }

  void _onScan(String raw) {
    setState(() {
      _scanning = false;
      _result = 'Scanned payload (${raw.length} chars) — relay API next milestone';
    });
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
            if (_scanning)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 280,
                  child: MobileScanner(
                    onDetect: (capture) {
                      final barcodes = capture.barcodes;
                      if (barcodes.isEmpty || !_scanning) return;

                      final value = barcodes.first.rawValue;
                      if (value != null && value.isNotEmpty) {
                        _onScan(value);
                      }
                    },
                  ),
                ),
              )
            else
              OutlinedButton(
                onPressed: () => setState(() {
                  _scanning = true;
                  _result = null;
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
              onPressed: _manualController.text.trim().isEmpty
                  ? null
                  : () => _onScan(_manualController.text.trim()),
              child: const Text('Use pasted payload'),
            ),
            if (_result != null) ...[
              const SizedBox(height: 16),
              Text(
                _result!,
                style: const TextStyle(color: Color(0xFF4ADE80)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
