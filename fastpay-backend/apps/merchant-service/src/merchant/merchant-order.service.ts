import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  MerchantOrder,
  MerchantOrderDocument,
  MerchantOrderStatus,
} from '@fastpay/schemas';

function randomOrderNumber(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

@Injectable()
export class MerchantOrderService {
  constructor(
    @InjectModel(MerchantOrder.name)
    private readonly orderModel: Model<MerchantOrderDocument>,
  ) {}

  async createInternal(input: {
    merchantOrgId: string;
    buyerUserId: string;
    amountRwf: number;
    title?: string;
    description?: string;
    escrowId?: string;
  }) {
    const order = await this.orderModel.create({
      merchantOrgId: new Types.ObjectId(input.merchantOrgId),
      orderNumber: randomOrderNumber(),
      buyerUserId: new Types.ObjectId(input.buyerUserId),
      escrowId: input.escrowId
        ? new Types.ObjectId(input.escrowId)
        : undefined,
      amountRwf: input.amountRwf,
      title: input.title?.trim(),
      description: input.description?.trim(),
      status: MerchantOrderStatus.PENDING,
    });

    return {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
    };
  }

  async updateStatusInternal(input: {
    orderId: string;
    status: string;
    shippingNote?: string;
  }) {
    if (!Types.ObjectId.isValid(input.orderId)) {
      throw new NotFoundException('Order not found');
    }

    const statusMap: Record<string, MerchantOrderStatus> = {
      pending: MerchantOrderStatus.PENDING,
      paid: MerchantOrderStatus.PAID,
      shipped: MerchantOrderStatus.SHIPPED,
      delivered: MerchantOrderStatus.DELIVERED,
      completed: MerchantOrderStatus.COMPLETED,
      disputed: MerchantOrderStatus.DISPUTED,
      cancelled: MerchantOrderStatus.CANCELLED,
    };

    const status = statusMap[input.status] ?? MerchantOrderStatus.PENDING;
    const $set: Record<string, unknown> = { status };

    if (status === MerchantOrderStatus.SHIPPED) {
      $set.shippedAt = new Date();
      if (input.shippingNote) $set.shippingNote = input.shippingNote.trim();
    }
    if (status === MerchantOrderStatus.DELIVERED) {
      $set.deliveredAt = new Date();
    }
    if (status === MerchantOrderStatus.COMPLETED) {
      $set.completedAt = new Date();
    }

    const order = await this.orderModel
      .findByIdAndUpdate(input.orderId, { $set }, { new: true })
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return this.toView(order);
  }

  async listForMerchant(merchantOrgId: string) {
    const orders = await this.orderModel
      .find({ merchantOrgId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return orders.map((o) => this.toView(o));
  }

  private toView(order: MerchantOrderDocument) {
    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      merchantOrgId: order.merchantOrgId.toString(),
      buyerUserId: order.buyerUserId.toString(),
      escrowId: order.escrowId?.toString(),
      amountRwf: order.amountRwf,
      title: order.title,
      description: order.description,
      status: order.status,
      shippingNote: order.shippingNote,
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      completedAt: order.completedAt?.toISOString(),
      createdAt: order.createdAt?.toISOString(),
    };
  }
}
