import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/security_repository.dart';
import '../models/security_models.dart';

final securityRepositoryProvider = Provider<SecurityRepository>((ref) {
  return SecurityRepository(ref.watch(apiClientProvider));
});

class SecurityScreen extends ConsumerStatefulWidget {
  const SecurityScreen({super.key});

  @override
  ConsumerState<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends ConsumerState<SecurityScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  SecuritySummary? _summary;
  List<SecuritySession> _sessions = [];
  List<SecurityAlert> _alerts = [];
  List<AuditEvent> _events = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = ref.read(securityRepositoryProvider);
      final results = await Future.wait([
        repo.fetchSummary(),
        repo.fetchSessions(),
        repo.fetchAlerts(),
        repo.fetchEvents(),
      ]);
      setState(() {
        _summary = results[0] as SecuritySummary;
        _sessions = results[1] as List<SecuritySession>;
        _alerts = results[2] as List<SecurityAlert>;
        _events = results[3] as List<AuditEvent>;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Security Center'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Activity'),
            Tab(text: 'Sessions'),
            Tab(text: 'Alerts'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : TabBarView(
                  controller: _tabs,
                  children: [
                    _OverviewTab(summary: _summary, onFreeze: _freeze),
                    _ActivityTab(events: _events),
                    _SessionsTab(
                      sessions: _sessions,
                      onRevoke: _revokeSession,
                      onRevokeAll: _revokeAll,
                    ),
                    _AlertsTab(alerts: _alerts),
                  ],
                ),
    );
  }

  Future<void> _freeze() async {
    await ref.read(securityRepositoryProvider).freezeAccount();
    await _load();
  }

  Future<void> _revokeSession(String id) async {
    await ref.read(securityRepositoryProvider).revokeSession(id);
    await _load();
  }

  Future<void> _revokeAll() async {
    await ref.read(securityRepositoryProvider).revokeOtherSessions();
    await _load();
  }
}

class _OverviewTab extends StatelessWidget {
  const _OverviewTab({required this.summary, required this.onFreeze});

  final SecuritySummary? summary;
  final VoidCallback onFreeze;

  @override
  Widget build(BuildContext context) {
    if (summary == null) return const SizedBox.shrink();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _StatTile('Active sessions', '${summary!.activeSessions}'),
        _StatTile('Trusted devices', '${summary!.trustedDevices}'),
        _StatTile('Unread alerts', '${summary!.unreadAlerts}'),
        _StatTile('Status', summary!.accountFrozen ? 'Frozen' : 'Active'),
        const SizedBox(height: 16),
        OutlinedButton(onPressed: onFreeze, child: const Text('Freeze account')),
      ],
    );
  }
}

class _ActivityTab extends StatelessWidget {
  const _ActivityTab({required this.events});
  final List<AuditEvent> events;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: events.length,
      itemBuilder: (_, i) {
        final e = events[i];
        return ListTile(
          title: Text(e.action),
          subtitle: Text(e.createdAt ?? ''),
        );
      },
    );
  }
}

class _SessionsTab extends StatelessWidget {
  const _SessionsTab({
    required this.sessions,
    required this.onRevoke,
    required this.onRevokeAll,
  });

  final List<SecuritySession> sessions;
  final ValueChanged<String> onRevoke;
  final VoidCallback onRevokeAll;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: OutlinedButton(
            onPressed: onRevokeAll,
            child: const Text('Revoke all other sessions'),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: sessions.length,
            itemBuilder: (_, i) {
              final s = sessions[i];
              return ListTile(
                title: Text('${s.deviceLabel}${s.current ? ' (this device)' : ''}'),
                subtitle: Text(s.lastActiveAt),
                trailing: s.current
                    ? null
                    : TextButton(
                        onPressed: () => onRevoke(s.sessionId),
                        child: const Text('Revoke'),
                      ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _AlertsTab extends StatelessWidget {
  const _AlertsTab({required this.alerts});
  final List<SecurityAlert> alerts;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: alerts.length,
      itemBuilder: (_, i) {
        final a = alerts[i];
        return ListTile(
          title: Text(a.title),
          subtitle: Text(a.body),
          trailing: a.readAt == null
              ? const Icon(Icons.circle, size: 10, color: Colors.cyan)
              : null,
        );
      },
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(title: Text(label), trailing: Text(value)),
    );
  }
}
