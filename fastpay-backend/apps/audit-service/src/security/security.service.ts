import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  AuditLog,
  AuditLogDocument,
  SecurityAlert,
  SecurityAlertDocument,
  TrustedDevice,
  TrustedDeviceDocument,
  User,
  UserDocument,
  UserSession,
  UserSessionDocument,
} from '@fastpay/schemas';

const AUTH_ACTIONS = new Set([
  'auth.register',
  'auth.login.success',
  'auth.login.failed',
  'auth.login.locked',
  'auth.refresh',
  'auth.refresh.failed',
  'auth.logout',
  'auth.biometric.enroll',
  'auth.biometric.login.success',
  'auth.biometric.login.failed',
  'auth.password.change',
  'auth.account.freeze',
  'auth.account.unfreeze',
  'auth.session.revoke',
  'auth.passcode_reset.verify',
  'auth.passcode_reset.failed',
]);

function actionCategory(action: string): 'auth' | 'payment' | 'security' | 'assistant' {
  if (action.startsWith('assistant.')) return 'assistant';
  if (action.startsWith('payment.')) return 'payment';
  if (action.startsWith('auth.') || action.startsWith('security.')) return 'auth';
  return 'security';
}

@Injectable()
export class SecurityService {
  constructor(
    @InjectModel(UserSession.name)
    private readonly sessionModel: Model<UserSessionDocument>,
    @InjectModel(TrustedDevice.name)
    private readonly deviceModel: Model<TrustedDeviceDocument>,
    @InjectModel(SecurityAlert.name)
    private readonly alertModel: Model<SecurityAlertDocument>,
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getSummary(userId: string) {
    const uid = new Types.ObjectId(userId);
    const [activeSessions, trustedDevices, unreadAlerts, user, lastLogin] =
      await Promise.all([
        this.sessionModel.countDocuments({ userId: uid, revokedAt: { $exists: false } }),
        this.deviceModel.countDocuments({ userId: uid, revokedAt: { $exists: false } }),
        this.alertModel.countDocuments({ userId: uid, readAt: { $exists: false } }),
        this.userModel.findById(uid).exec(),
        this.auditModel
          .findOne({ userId: uid, action: 'auth.login.success' })
          .sort({ createdAt: -1 })
          .exec(),
      ]);

    const frozen =
      Boolean(user?.frozenUntil && user.frozenUntil.getTime() > Date.now());

    return {
      lastLogin: lastLogin?.createdAt?.toISOString() ?? null,
      activeSessions,
      trustedDevices,
      unreadAlerts,
      accountFrozen: frozen,
    };
  }

  async listSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.sessionModel
      .find({ userId: new Types.ObjectId(userId), revokedAt: { $exists: false } })
      .sort({ lastActiveAt: -1 })
      .exec();

    return {
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        deviceLabel: s.deviceLabel ?? 'Unknown device',
        platform: s.platform ?? 'unknown',
        ipAddress: s.ipAddress,
        lastActiveAt: s.lastActiveAt.toISOString(),
        createdAt: s.createdAt?.toISOString(),
        current: s.sessionId === currentSessionId,
      })),
    };
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.sessionModel
      .updateOne(
        {
          userId: new Types.ObjectId(userId),
          sessionId,
          revokedAt: { $exists: false },
        },
        { $set: { revokedAt: new Date() } },
      )
      .exec();
    return { success: true as const };
  }

  async revokeOtherSessions(userId: string, keepSessionId?: string) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      revokedAt: { $exists: false },
    };
    if (keepSessionId) {
      filter.sessionId = { $ne: keepSessionId };
    }
    await this.sessionModel
      .updateMany(filter, { $set: { revokedAt: new Date() } })
      .exec();
    return { success: true as const };
  }

  async listDevices(userId: string) {
    const devices = await this.deviceModel
      .find({ userId: new Types.ObjectId(userId), revokedAt: { $exists: false } })
      .sort({ lastSeenAt: -1 })
      .exec();

    return {
      devices: devices.map((d) => ({
        deviceId: d.deviceId,
        platform: d.platform ?? 'unknown',
        enrolledAt: d.enrolledAt.toISOString(),
        lastSeenAt: d.lastSeenAt.toISOString(),
      })),
    };
  }

  async revokeDevice(userId: string, deviceId: string) {
    await this.deviceModel
      .updateOne(
        {
          userId: new Types.ObjectId(userId),
          deviceId,
          revokedAt: { $exists: false },
        },
        { $set: { revokedAt: new Date() } },
      )
      .exec();

    await this.userModel
      .updateOne(
        { _id: new Types.ObjectId(userId), biometricDeviceId: deviceId },
        {
          $set: { biometricEnabled: false },
          $unset: { biometricDeviceId: 1, biometricPublicKey: 1 },
        },
      )
      .exec();

    return { success: true as const };
  }

  async listAlerts(userId: string, limit = 20, cursor?: string) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    const alerts = await this.alertModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50))
      .exec();

    const nextCursor =
      alerts.length > 0
        ? alerts[alerts.length - 1].createdAt?.toISOString()
        : undefined;

    return {
      alerts: alerts.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        body: a.body,
        readAt: a.readAt?.toISOString() ?? null,
        createdAt: a.createdAt?.toISOString(),
      })),
      nextCursor,
    };
  }

  async markAlertRead(userId: string, alertId: string) {
    await this.alertModel
      .updateOne(
        { _id: new Types.ObjectId(alertId), userId: new Types.ObjectId(userId) },
        { $set: { readAt: new Date() } },
      )
      .exec();
    return { success: true as const };
  }

  async listAuditEvents(
    userId: string,
    limit = 20,
    cursor?: string,
    category?: string,
  ) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }
    if (category) {
      if (category === 'auth') {
        filter.action = { $in: [...AUTH_ACTIONS] };
      } else if (category === 'payment') {
        filter.action = { $regex: /^payment\./ };
      } else if (category === 'assistant') {
        filter.action = { $regex: /^assistant\./ };
      } else if (category === 'security') {
        filter.action = { $regex: /^security\./ };
      }
    }

    const events = await this.auditModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50))
      .exec();

    const nextCursor =
      events.length > 0
        ? events[events.length - 1].createdAt?.toISOString()
        : undefined;

    return {
      events: events.map((e) => ({
        id: e._id.toString(),
        action: e.action,
        category: e.category ?? actionCategory(e.action),
        severity: e.severity ?? 'info',
        ipAddress: e.ipAddress,
        createdAt: e.createdAt?.toISOString(),
        details: e.details ?? {},
      })),
      nextCursor,
    };
  }
}
