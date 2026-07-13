import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  SecurityAlert,
  SecurityAlertDocument,
  SecurityAlertType,
} from '@fastpay/schemas';

@Injectable()
export class SecurityAlertService {
  constructor(
    @InjectModel(SecurityAlert.name)
    private readonly alertModel: Model<SecurityAlertDocument>,
  ) {}

  async create(
    userId: string,
    type: SecurityAlertType,
    title: string,
    body: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.alertModel.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      body,
      metadata: metadata ?? {},
    });
  }
}
