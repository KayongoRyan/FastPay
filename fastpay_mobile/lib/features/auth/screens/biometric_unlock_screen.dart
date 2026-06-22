import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';

class BiometricUnlockScreen extends ConsumerWidget {
  const BiometricUnlockScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final notifier = ref.read(authProvider.notifier);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'FastPay is locked',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                auth.user != null
                    ? 'Use ${auth.biometricLabel} to unlock ${auth.user!.fullName}\'s account'
                    : 'Use ${auth.biometricLabel} to continue',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFFA3A3A3)),
              ),
              if (auth.error != null) ...[
                const SizedBox(height: 16),
                Text(
                  auth.error!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFFF87171)),
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: auth.isLoading
                    ? null
                    : () async {
                        await notifier.unlockWithBiometric();
                        if (context.mounted &&
                            ref.read(authProvider).isAuthenticated) {
                          context.go('/');
                        }
                      },
                child: Text(
                  auth.isLoading
                      ? 'Unlocking...'
                      : 'Unlock with ${auth.biometricLabel}',
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: auth.isLoading
                    ? null
                    : () async {
                        await notifier.logout();
                        if (context.mounted) context.go('/login');
                      },
                child: const Text('Sign in with password'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
