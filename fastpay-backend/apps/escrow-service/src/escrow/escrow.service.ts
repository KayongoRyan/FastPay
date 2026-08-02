import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  EscrowContract,
  EscrowContractDocument,
  EscrowStatus,
} from '@fastpay/schemas';

import {
  CreateEscrowDto,
  DisputeEscrowDto,
  FundEscrowDto,
  ShipEscrowDto,
} from './dto/escrow.dto';
import { MerchantBridgeClient } from './merchant-bridge.client';

function randomEscrowCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `ESC${n}`;
}

const ACTIVE_STATUSES = new Set([
  EscrowStatus.PENDING,
  EscrowStatus.PAID,
  EscrowStatus.SHIPPED,
  EscrowStatus.DELIVERED,
  EscrowStatus.DISPUTED,
]);

@Injectable()
export class EscrowService {
  constructor(
    @InjectModel(EscrowContract.name)
    private readonly escrowModel: Model<EscrowContractDocument>,
    private readonly merchantBridge: MerchantBridgeClient,
  ) {}

  async create(buyerUserId: string, dto: CreateEscrowDto) {
    const merchant = await this.merchantBridge.lookup(dto.merchantCode);
    if (!merchant) {
      throw new NotFoundException('Merchant not found for that code');
    }

    let escrowCode = randomEscrowCode();
    for (let i = 0; i < 8; i++) {
      const exists = await this.escrowModel.exists({ escrowCode }).exec();
      if (!exists) break;
      escrowCode = randomEscrowCode();
    }

    const autoReleaseAt =
      dto.autoReleaseHoursAfterDelivery != null
        ? undefined
        : undefined;

    const escrow = await this.escrowModel.create({
      escrowCode,
      buyerUserId: new Types.ObjectId(buyerUserId),
      sellerMerchantOrgId: new Types.ObjectId(merchant.orgId),
      sellerMerchantCode: merchant.code,
      sellerBusinessName: merchant.name,
      amountRwf: dto.amountRwf,
      currency: 'RWF',
      status: EscrowStatus.PENDING,
      title: dto.title?.trim(),
      description: dto.description?.trim(),
      releaseRules: {
        requiresBuyerConfirm: dto.requiresBuyerConfirm ?? true,
        autoReleaseHoursAfterDelivery: dto.autoReleaseHoursAfterDelivery,
        autoReleaseAt,
      },
    });

    const order = await this.merchantBridge.createOrder({
      merchantOrgId: merchant.orgId,
      buyerUserId,
      amountRwf: dto.amountRwf,
      title: dto.title,
      description: dto.description,
      escrowId: escrow._id.toString(),
    });

    if (order) {
      escrow.orderId = new Types.ObjectId(order.orderId);
      await escrow.save();
    }

    return this.toView(escrow);
  }

  async listForBuyer(buyerUserId: string) {
    const rows = await this.escrowModel
      .find({ buyerUserId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return rows.map((r) => this.toView(r));
  }

  async listForMerchant(merchantOrgId: string) {
    const rows = await this.escrowModel
      .find({ sellerMerchantOrgId: merchantOrgId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
    return rows.map((r) => this.toView(r));
  }

  async getById(id: string, userId: string, merchantOrgId?: string) {
    const escrow = await this.requireEscrow(id);
    this.assertParticipant(escrow, userId, merchantOrgId);
    return this.toView(escrow);
  }

  /** Buyer funds escrow — funds held until release. */
  async fund(buyerUserId: string, id: string, dto: FundEscrowDto) {
    const escrow = await this.requireEscrow(id);
    if (escrow.buyerUserId.toString() !== buyerUserId) {
      throw new ForbiddenException('Only the buyer can fund this escrow');
    }
    if (escrow.status !== EscrowStatus.PENDING) {
      throw new BadRequestException('Escrow is not awaiting payment');
    }

    const paymentRef =
      dto.paymentRef?.trim() ||
      `ESC-FUND-${escrow.escrowCode}-${Date.now().toString(36).toUpperCase()}`;

    escrow.status = EscrowStatus.PAID;
    escrow.fundedAt = new Date();
    escrow.fundedPaymentRef = paymentRef;
    await escrow.save();

    if (escrow.orderId) {
      await this.merchantBridge.updateOrderStatus({
        orderId: escrow.orderId.toString(),
        status: 'paid',
      });
    }

    return this.toView(escrow);
  }

  /** Merchant marks goods/services as shipped. */
  async ship(merchantOrgId: string, id: string, dto: ShipEscrowDto) {
    const escrow = await this.requireEscrow(id);
    if (escrow.sellerMerchantOrgId.toString() !== merchantOrgId) {
      throw new ForbiddenException('Only the seller can mark this shipped');
    }
    if (escrow.status !== EscrowStatus.PAID) {
      throw new BadRequestException('Escrow must be paid before shipping');
    }

    escrow.status = EscrowStatus.SHIPPED;
    escrow.shippedAt = new Date();
    escrow.shippingNote = dto.shippingNote?.trim();
    await escrow.save();

    if (escrow.orderId) {
      await this.merchantBridge.updateOrderStatus({
        orderId: escrow.orderId.toString(),
        status: 'shipped',
        shippingNote: dto.shippingNote,
      });
    }

    return this.toView(escrow);
  }

  /** Merchant (or buyer) marks delivered. */
  async deliver(id: string, userId: string, merchantOrgId?: string) {
    const escrow = await this.requireEscrow(id);
    this.assertParticipant(escrow, userId, merchantOrgId);

    if (
      escrow.status !== EscrowStatus.SHIPPED &&
      escrow.status !== EscrowStatus.PAID
    ) {
      throw new BadRequestException('Escrow cannot be marked delivered in this state');
    }

    escrow.status = EscrowStatus.DELIVERED;
    escrow.deliveredAt = new Date();

    const hours = escrow.releaseRules?.autoReleaseHoursAfterDelivery;
    if (hours && hours > 0) {
      escrow.releaseRules.autoReleaseAt = new Date(
        Date.now() + hours * 3600_000,
      );
    }

    await escrow.save();

    if (escrow.orderId) {
      await this.merchantBridge.updateOrderStatus({
        orderId: escrow.orderId.toString(),
        status: 'delivered',
      });
    }

    // Auto-release when buyer confirm is not required
    if (escrow.releaseRules?.requiresBuyerConfirm === false) {
      return this.releaseInternal(escrow);
    }

    return this.toView(escrow);
  }

  /** Buyer confirms → settle merchant (Released). */
  async confirm(buyerUserId: string, id: string) {
    const escrow = await this.requireEscrow(id);
    if (escrow.buyerUserId.toString() !== buyerUserId) {
      throw new ForbiddenException('Only the buyer can confirm release');
    }
    if (
      escrow.status !== EscrowStatus.DELIVERED &&
      escrow.status !== EscrowStatus.SHIPPED
    ) {
      throw new BadRequestException(
        'Confirm after the merchant has shipped or delivered',
      );
    }
    return this.releaseInternal(escrow);
  }

  async dispute(
    id: string,
    userId: string,
    dto: DisputeEscrowDto,
    merchantOrgId?: string,
  ) {
    const escrow = await this.requireEscrow(id);
    this.assertParticipant(escrow, userId, merchantOrgId);

    if (
      ![EscrowStatus.PAID, EscrowStatus.SHIPPED, EscrowStatus.DELIVERED].includes(
        escrow.status,
      )
    ) {
      throw new BadRequestException('This escrow cannot be disputed now');
    }

    escrow.status = EscrowStatus.DISPUTED;
    escrow.disputedAt = new Date();
    escrow.disputeReason = dto.reason.trim();
    escrow.disputedByUserId = new Types.ObjectId(userId);
    await escrow.save();

    if (escrow.orderId) {
      await this.merchantBridge.updateOrderStatus({
        orderId: escrow.orderId.toString(),
        status: 'disputed',
      });
    }

    return this.toView(escrow);
  }

  async cancel(buyerUserId: string, id: string) {
    const escrow = await this.requireEscrow(id);
    if (escrow.buyerUserId.toString() !== buyerUserId) {
      throw new ForbiddenException('Only the buyer can cancel');
    }
    if (escrow.status !== EscrowStatus.PENDING) {
      throw new BadRequestException('Only unpaid escrows can be cancelled');
    }
    escrow.status = EscrowStatus.CANCELLED;
    escrow.cancelledAt = new Date();
    await escrow.save();

    if (escrow.orderId) {
      await this.merchantBridge.updateOrderStatus({
        orderId: escrow.orderId.toString(),
        status: 'cancelled',
      });
    }

    return this.toView(escrow);
  }

  private async releaseInternal(escrow: EscrowContractDocument) {
    if (escrow.status === EscrowStatus.RELEASED) {
      return this.toView(escrow);
    }

    const paymentRef = `ESC-REL-${escrow.escrowCode}-${Date.now().toString(36).toUpperCase()}`;

    await this.merchantBridge.recordSettlement({
      orgId: escrow.sellerMerchantOrgId.toString(),
      amountRwf: escrow.amountRwf,
      consumerUserId: escrow.buyerUserId.toString(),
      merchantCode: escrow.sellerMerchantCode,
      paymentRef,
    });

    escrow.status = EscrowStatus.RELEASED;
    escrow.releasedAt = new Date();
    escrow.releasePaymentRef = paymentRef;
    await escrow.save();

    if (escrow.orderId) {
      await this.merchantBridge.updateOrderStatus({
        orderId: escrow.orderId.toString(),
        status: 'completed',
      });
    }

    return this.toView(escrow);
  }

  private async requireEscrow(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Escrow not found');
    }
    const escrow = await this.escrowModel.findById(id).exec();
    if (!escrow) throw new NotFoundException('Escrow not found');
    return escrow;
  }

  private assertParticipant(
    escrow: EscrowContractDocument,
    userId: string,
    merchantOrgId?: string,
  ) {
    const isBuyer = escrow.buyerUserId.toString() === userId;
    const isSeller =
      !!merchantOrgId &&
      escrow.sellerMerchantOrgId.toString() === merchantOrgId;
    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('Not a party to this escrow');
    }
  }

  private toView(escrow: EscrowContractDocument) {
    return {
      id: escrow._id.toString(),
      escrowCode: escrow.escrowCode,
      buyerUserId: escrow.buyerUserId.toString(),
      sellerMerchantOrgId: escrow.sellerMerchantOrgId.toString(),
      sellerMerchantCode: escrow.sellerMerchantCode,
      sellerBusinessName: escrow.sellerBusinessName,
      amountRwf: escrow.amountRwf,
      currency: escrow.currency,
      status: escrow.status,
      title: escrow.title,
      description: escrow.description,
      releaseRules: {
        requiresBuyerConfirm: escrow.releaseRules?.requiresBuyerConfirm ?? true,
        autoReleaseHoursAfterDelivery:
          escrow.releaseRules?.autoReleaseHoursAfterDelivery,
        autoReleaseAt: escrow.releaseRules?.autoReleaseAt?.toISOString(),
      },
      orderId: escrow.orderId?.toString(),
      fundedAt: escrow.fundedAt?.toISOString(),
      fundedPaymentRef: escrow.fundedPaymentRef,
      shippedAt: escrow.shippedAt?.toISOString(),
      shippingNote: escrow.shippingNote,
      deliveredAt: escrow.deliveredAt?.toISOString(),
      releasedAt: escrow.releasedAt?.toISOString(),
      releasePaymentRef: escrow.releasePaymentRef,
      disputedAt: escrow.disputedAt?.toISOString(),
      disputeReason: escrow.disputeReason,
      isActive: ACTIVE_STATUSES.has(escrow.status),
      createdAt: escrow.createdAt?.toISOString(),
      updatedAt: escrow.updatedAt?.toISOString(),
    };
  }
}
