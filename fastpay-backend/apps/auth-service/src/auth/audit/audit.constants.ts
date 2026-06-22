export const AUTH_AUDIT_ACTIONS = {
  REGISTER: 'auth.register',
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGIN_LOCKED: 'auth.login.locked',
  REFRESH: 'auth.refresh',
  REFRESH_FAILED: 'auth.refresh.failed',
  BIOMETRIC_ENROLL: 'auth.biometric.enroll',
  BIOMETRIC_LOGIN_SUCCESS: 'auth.biometric.login.success',
  BIOMETRIC_LOGIN_FAILED: 'auth.biometric.login.failed',
  LOGOUT: 'auth.logout',
} as const;

export type AuthAuditAction =
  (typeof AUTH_AUDIT_ACTIONS)[keyof typeof AUTH_AUDIT_ACTIONS];

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEventInput {
  action: AuthAuditAction;
  userId?: string;
  details?: Record<string, unknown>;
  context?: AuditContext;
}
