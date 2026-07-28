import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/providers/auth_provider.dart';
import '../wallet/providers/wallet_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(walletProvider.notifier).refresh());
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final walletState = ref.watch(walletProvider);

    if (!auth.isReady || auth.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final user = auth.user!;
    final wallet = walletState.wallet;

    return Scaffold(
      appBar: AppBar(
        title: const Text('FastPay Wallet'),
        actions: [
          IconButton(
            onPressed: () => context.push('/settings'),
            icon: const Icon(Icons.settings_outlined),
          ),
          IconButton(
            onPressed: auth.isLoading
                ? null
                : () async {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) context.go('/login');
                  },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(walletProvider.notifier).refresh(),
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Text(
              'Signed in as ${user.fullName}',
              style: const TextStyle(color: Color(0xFFA3A3A3)),
            ),
            const SizedBox(height: 16),
            _InfoCard(
              children: [
                _InfoRow(label: 'Account', value: user.email ?? user.phone ?? user.id),
                _InfoRow(label: 'KYC', value: '${user.kycStatus} (level ${user.kycLevel})'),
                if (wallet != null) ...[
                  _InfoRow(label: 'Wallet #', value: wallet.accountNumber),
                  _InfoRow(
                    label: 'Balance',
                    value: 'RWF ${wallet.balance.toStringAsFixed(0)}',
                  ),
                  _InfoRow(
                    label: 'Stellar',
                    value: '${wallet.publicKey.substring(0, 8)}…',
                  ),
                ] else
                  const _InfoRow(label: 'Wallet', value: 'Not loaded — tap refresh'),
              ],
            ),
            if (walletState.error != null) ...[
              const SizedBox(height: 12),
              Text(
                walletState.error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ],
            const SizedBox(height: 16),
            if (wallet == null)
              ElevatedButton(
                onPressed: walletState.loading
                    ? null
                    : () => ref.read(walletProvider.notifier).provision(),
                child: walletState.loading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Provision wallet'),
              ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => context.push('/kyc'),
              child: const Text('KYC verification'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => context.push('/offline/send'),
              child: const Text('Send & relay'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => context.push('/offline/receive'),
              child: const Text('Offline receive (scan & relay)'),
            ),
            if (walletState.history.isNotEmpty) ...[
              const SizedBox(height: 24),
              const Text(
                'Recent activity',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              ...walletState.history.take(5).map(
                    (item) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        '${item.direction == 'out' ? '−' : '+'}${item.amount} ${item.asset}',
                      ),
                      subtitle: Text(item.counterparty),
                      trailing: Text(item.status),
                    ),
                  ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFF262626)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF737373),
              fontSize: 12,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 4),
          Text(value),
        ],
      ),
    );
  }
}
