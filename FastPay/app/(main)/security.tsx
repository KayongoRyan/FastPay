import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AlertTriangle,
  Bell,
  Fingerprint,
  History,
  Laptop,
  Shield,
  Snowflake,
} from 'lucide-react-native';

import { TabScreenLayout } from '@/components/layout/TabScreenLayout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSecurityStore } from '@/store/securityStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'devices', label: 'Devices' },
  { id: 'alerts', label: 'Alerts' },
] as const;

export default function SecurityScreen() {
  const { user, isReady, isLoading } = useRequireAuth();
  const {
    tab,
    summary,
    sessions,
    devices,
    alerts,
    events,
    loading,
    error,
    setTab,
    loadAll,
    revokeSessionById,
    revokeAllOtherSessions,
    revokeDeviceById,
    readAlert,
    freeze,
  } = useSecurityStore();

  useEffect(() => {
    if (user) void loadAll();
  }, [user, loadAll]);

  if (!isReady || isLoading || !user) {
    return (
      <TabScreenLayout scroll={false}>
        <ActivityIndicator color={colors.primary} />
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout>
      <Text style={styles.title}>Security Center</Text>
      <Text style={styles.subtitle}>Sessions, devices, alerts, and activity</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tab, tab === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {tab === 'overview' && summary ? (
        <View style={styles.grid}>
          <StatCard icon={Laptop} label="Active sessions" value={String(summary.activeSessions)} />
          <StatCard icon={Fingerprint} label="Trusted devices" value={String(summary.trustedDevices)} />
          <StatCard icon={Bell} label="Unread alerts" value={String(summary.unreadAlerts)} />
          <StatCard
            icon={Shield}
            label="Account status"
            value={summary.accountFrozen ? 'Frozen' : 'Active'}
          />
          <Pressable style={styles.dangerBtn} onPress={() => {
            Alert.alert('Freeze account?', 'You can unfreeze after verifying your password.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Freeze', style: 'destructive', onPress: () => void freeze() },
            ]);
          }}>
            <Snowflake size={18} color={colors.error} />
            <Text style={styles.dangerText}>Freeze account</Text>
          </Pressable>
        </View>
      ) : null}

      {tab === 'activity' ? (
        <View style={styles.list}>
          {events.map((e) => (
            <View key={e.id} style={styles.row}>
              <History size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{e.action}</Text>
                <Text style={styles.rowMeta}>{e.createdAt ?? ''}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'sessions' ? (
        <View style={styles.list}>
          <Pressable style={styles.outlineBtn} onPress={() => void revokeAllOtherSessions()}>
            <Text style={styles.outlineText}>Revoke all other sessions</Text>
          </Pressable>
          {sessions.map((s) => (
            <View key={s.sessionId} style={styles.row}>
              <Laptop size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {s.deviceLabel}{s.current ? ' (this device)' : ''}
                </Text>
                <Text style={styles.rowMeta}>{s.lastActiveAt}</Text>
              </View>
              {!s.current ? (
                <Pressable onPress={() => void revokeSessionById(s.sessionId)}>
                  <Text style={styles.link}>Revoke</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'devices' ? (
        <View style={styles.list}>
          {devices.map((d) => (
            <View key={d.deviceId} style={styles.row}>
              <Fingerprint size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{d.platform}</Text>
                <Text style={styles.rowMeta}>Last seen {d.lastSeenAt}</Text>
              </View>
              <Pressable onPress={() => void revokeDeviceById(d.deviceId)}>
                <Text style={styles.link}>Revoke</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'alerts' ? (
        <View style={styles.list}>
          {alerts.map((a) => (
            <Pressable key={a.id} style={styles.row} onPress={() => void readAlert(a.id)}>
              <AlertTriangle size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{a.title}</Text>
                <Text style={styles.rowMeta}>{a.body}</Text>
              </View>
              {!a.readAt ? <View style={styles.dot} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </TabScreenLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.card}>
      <Icon size={20} color={colors.primary} />
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginBottom: spacing.md },
  tabs: { marginBottom: spacing.md },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: { backgroundColor: 'rgba(0,174,239,0.2)' },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
  },
  cardValue: { color: colors.white, fontSize: 22, fontWeight: '800' },
  cardLabel: { color: colors.textMuted, fontSize: 12 },
  list: { gap: 10, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowTitle: { color: colors.white, fontWeight: '600' },
  rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  link: { color: colors.primary, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  error: { color: colors.error, marginTop: 12 },
  dangerBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
  },
  dangerText: { color: colors.error, fontWeight: '600' },
  outlineBtn: {
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineText: { color: colors.primary, fontWeight: '600' },
});
