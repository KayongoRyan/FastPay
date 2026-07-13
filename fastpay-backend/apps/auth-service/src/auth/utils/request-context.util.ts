import type { Request } from 'express';

import { AuditContext } from '../audit/audit.constants';

export function extractAuditContext(req: Request): AuditContext {
  const forwarded = req.headers['x-forwarded-for'];
  const ipFromHeader = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0]?.trim();

  return {
    ipAddress: ipFromHeader ?? req.ip ?? req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    sessionId: req.headers['x-session-id'] as string | undefined,
    deviceId: req.headers['x-device-id'] as string | undefined,
    platform: req.headers['x-platform'] as string | undefined,
    deviceLabel: req.headers['x-device-label'] as string | undefined,
  };
}
