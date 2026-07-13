import { apiDeleteAuth, apiGetAuth, apiPatchAuth, apiPostAuth } from '@/lib/api/client';

export interface SecuritySummary {
  lastLogin: string | null;
  activeSessions: number;
  trustedDevices: number;
  unreadAlerts: number;
  accountFrozen: boolean;
}

export interface SecuritySession {
  sessionId: string;
  deviceLabel: string;
  platform: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt?: string;
  current: boolean;
}

export interface TrustedDevice {
  deviceId: string;
  platform: string;
  enrolledAt: string;
  lastSeenAt: string;
}

export interface SecurityAlert {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  category: string;
  severity: string;
  ipAddress?: string;
  createdAt?: string;
  details: Record<string, unknown>;
}

export function fetchSecuritySummary() {
  return apiGetAuth<SecuritySummary>('/security/summary');
}

export function fetchSecuritySessions() {
  return apiGetAuth<{ sessions: SecuritySession[] }>('/security/sessions');
}

export function revokeSession(sessionId: string) {
  return apiDeleteAuth<{ success: true }>(`/security/sessions/${sessionId}`);
}

export function revokeOtherSessions() {
  return apiDeleteAuth<{ success: true }>('/security/sessions');
}

export function fetchTrustedDevices() {
  return apiGetAuth<{ devices: TrustedDevice[] }>('/security/devices');
}

export function revokeTrustedDevice(deviceId: string) {
  return apiDeleteAuth<{ success: true }>(`/security/devices/${deviceId}`);
}

export function fetchSecurityAlerts(limit = 20, cursor?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return apiGetAuth<{ alerts: SecurityAlert[]; nextCursor?: string }>(
    `/security/alerts?${params.toString()}`,
  );
}

export function markAlertRead(alertId: string) {
  return apiPatchAuth<{ success: true }>(`/security/alerts/${alertId}/read`, {});
}

export function fetchAuditEvents(limit = 20, cursor?: string, category?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  if (category) params.set('category', category);
  return apiGetAuth<{ events: AuditEvent[]; nextCursor?: string }>(
    `/audit/events?${params.toString()}`,
  );
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiPostAuth<{ success: true }>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
}

export function freezeAccount() {
  return apiPostAuth<{ success: true; frozenUntil: string }>('/auth/freeze-account', {});
}

export function unfreezeAccount() {
  return apiPostAuth<{ success: true }>('/auth/unfreeze-account', {});
}
