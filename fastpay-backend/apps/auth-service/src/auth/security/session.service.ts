import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  TrustedDevice,
  TrustedDeviceDocument,
  UserSession,
  UserSessionDocument,
} from '@fastpay/schemas';

import { AuditContext } from '../audit/audit.constants';

export interface SessionContext extends AuditContext {
  platform?: string;
  deviceLabel?: string;
}

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(UserSession.name)
    private readonly sessionModel: Model<UserSessionDocument>,
    @InjectModel(TrustedDevice.name)
    private readonly deviceModel: Model<TrustedDeviceDocument>,
  ) {}

  async createSession(params: {
    userId: string;
    sessionId: string;
    refreshTokenHash: string;
    context?: SessionContext;
  }): Promise<void> {
    await this.sessionModel.create({
      userId: new Types.ObjectId(params.userId),
      sessionId: params.sessionId,
      refreshTokenHash: params.refreshTokenHash,
      deviceLabel: params.context?.deviceLabel ?? this.inferDeviceLabel(params.context?.userAgent),
      deviceId: params.context?.deviceId,
      platform: params.context?.platform ?? 'unknown',
      ipAddress: params.context?.ipAddress,
      userAgent: params.context?.userAgent,
      lastActiveAt: new Date(),
    });
  }

  async validateRefreshSession(
    sessionId: string,
    refreshTokenHash: string,
  ): Promise<UserSessionDocument | null> {
    return this.sessionModel
      .findOne({
        sessionId,
        refreshTokenHash,
        revokedAt: { $exists: false },
      })
      .select('+refreshTokenHash')
      .exec();
  }

  async rotateSession(
    oldSessionId: string,
    newSessionId: string,
    refreshTokenHash: string,
    context?: SessionContext,
  ): Promise<void> {
    await this.sessionModel
      .updateOne(
        { sessionId: oldSessionId, revokedAt: { $exists: false } },
        {
          $set: {
            sessionId: newSessionId,
            refreshTokenHash,
            lastActiveAt: new Date(),
            ipAddress: context?.ipAddress,
            userAgent: context?.userAgent,
          },
        },
      )
      .exec();
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.sessionModel
      .updateOne(
        { sessionId, revokedAt: { $exists: false } },
        { $set: { lastActiveAt: new Date() } },
      )
      .exec();
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionModel
      .updateOne(
        { sessionId, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } },
      )
      .exec();
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void> {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      revokedAt: { $exists: false },
    };
    if (exceptSessionId) {
      filter.sessionId = { $ne: exceptSessionId };
    }
    await this.sessionModel
      .updateMany(filter, { $set: { revokedAt: new Date() } })
      .exec();
  }

  async upsertTrustedDevice(params: {
    userId: string;
    deviceId: string;
    publicKey: string;
    platform?: string;
  }): Promise<void> {
    const now = new Date();
    await this.deviceModel
      .updateOne(
        {
          userId: new Types.ObjectId(params.userId),
          deviceId: params.deviceId,
        },
        {
          $set: {
            publicKey: params.publicKey,
            platform: params.platform ?? 'unknown',
            lastSeenAt: now,
            revokedAt: undefined,
          },
          $setOnInsert: {
            enrolledAt: now,
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async revokeTrustedDevice(userId: string, deviceId: string): Promise<void> {
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
  }

  async assertSessionActive(sessionId: string): Promise<void> {
    const session = await this.sessionModel
      .findOne({ sessionId, revokedAt: { $exists: false } })
      .exec();
    if (!session) {
      throw new UnauthorizedException('Session has been revoked');
    }
  }

  private inferDeviceLabel(userAgent?: string): string {
    if (!userAgent) return 'Unknown device';
    if (/iPhone|iPad/i.test(userAgent)) return 'iOS device';
    if (/Android/i.test(userAgent)) return 'Android device';
    if (/Windows/i.test(userAgent)) return 'Windows device';
    if (/Mac/i.test(userAgent)) return 'Mac device';
    return 'Unknown device';
  }
}
