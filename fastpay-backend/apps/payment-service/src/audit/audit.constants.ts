export const PAYMENT_AUDIT_ACTIONS = {
  RELAY_ACCEPTED: 'payment.relay.accepted',
  RELAY_CONFIRMED: 'payment.relay.confirmed',
  RELAY_FAILED: 'payment.relay.failed',
} as const;

export interface PaymentAuditEvent {
  action: string;
  userId?: string;
  details?: Record<string, unknown>;
}
