import { create } from 'zustand';

import {
  fetchAuditEvents,
  fetchSecurityAlerts,
  fetchSecuritySessions,
  fetchSecuritySummary,
  fetchTrustedDevices,
  freezeAccount,
  markAlertRead,
  revokeOtherSessions,
  revokeSession,
  revokeTrustedDevice,
  type AuditEvent,
  type SecurityAlert,
  type SecuritySession,
  type SecuritySummary,
  type TrustedDevice,
} from '@/lib/api/security';

type SecurityTab = 'overview' | 'activity' | 'sessions' | 'devices' | 'alerts';

interface SecurityState {
  tab: SecurityTab;
  summary: SecuritySummary | null;
  sessions: SecuritySession[];
  devices: TrustedDevice[];
  alerts: SecurityAlert[];
  events: AuditEvent[];
  loading: boolean;
  error: string | null;
  setTab: (tab: SecurityTab) => void;
  loadAll: () => Promise<void>;
  revokeSessionById: (sessionId: string) => Promise<void>;
  revokeAllOtherSessions: () => Promise<void>;
  revokeDeviceById: (deviceId: string) => Promise<void>;
  readAlert: (alertId: string) => Promise<void>;
  freeze: () => Promise<void>;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  tab: 'overview',
  summary: null,
  sessions: [],
  devices: [],
  alerts: [],
  events: [],
  loading: false,
  error: null,

  setTab: (tab) => set({ tab }),

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const [summary, sessionsRes, devicesRes, alertsRes, eventsRes] =
        await Promise.all([
          fetchSecuritySummary(),
          fetchSecuritySessions(),
          fetchTrustedDevices(),
          fetchSecurityAlerts(),
          fetchAuditEvents(30),
        ]);
      set({
        summary,
        sessions: sessionsRes.sessions,
        devices: devicesRes.devices,
        alerts: alertsRes.alerts,
        events: eventsRes.events,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load security data',
      });
    }
  },

  revokeSessionById: async (sessionId) => {
    await revokeSession(sessionId);
    await get().loadAll();
  },

  revokeAllOtherSessions: async () => {
    await revokeOtherSessions();
    await get().loadAll();
  },

  revokeDeviceById: async (deviceId) => {
    await revokeTrustedDevice(deviceId);
    await get().loadAll();
  },

  readAlert: async (alertId) => {
    await markAlertRead(alertId);
    await get().loadAll();
  },

  freeze: async () => {
    await freezeAccount();
    await get().loadAll();
  },
}));
