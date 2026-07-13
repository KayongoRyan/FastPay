import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.shield_outlined),
            title: const Text('Security Center'),
            subtitle: const Text('Sessions, alerts, and activity'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/security'),
          ),
          ListTile(
            leading: const Icon(Icons.fingerprint),
            title: const Text('Biometric unlock'),
            subtitle: const Text('Manage from home screen'),
          ),
        ],
      ),
    );
  }
}
