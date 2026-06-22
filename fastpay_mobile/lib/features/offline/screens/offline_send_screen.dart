import 'package:flutter/material.dart';

/// Offline send — Stellar signing + QR generation (next milestone).
class OfflineSendScreen extends StatelessWidget {
  const OfflineSendScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Offline Send')),
      body: const Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Offline send',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Sign Stellar payments offline and share via QR. '
              'Will use stellar_sdk + secure key storage in the next milestone.',
              style: TextStyle(color: Color(0xFFA3A3A3)),
            ),
          ],
        ),
      ),
    );
  }
}
