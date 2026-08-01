import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  MerchantProduct,
  MerchantProductDocument,
  MerchantProductStatus,
  MerchantStockMovement,
  MerchantStockMovementDocument,
  MerchantStockMovementType,
} from '@fastpay/schemas';

import { MerchantOrgService } from './merchant-org.service';

@Injectable()
export class MerchantInventoryService {
  constructor(
    @InjectModel(MerchantProduct.name)
    private readonly productModel: Model<MerchantProductDocument>,
    @InjectModel(MerchantStockMovement.name)
    private readonly movementModel: Model<MerchantStockMovementDocument>,
    private readonly orgService: MerchantOrgService,
  ) {}

  async listProducts(ownerUserId: string) {
    const org = await this.requireOrg(ownerUserId);
    const products = await this.productModel
      .find({
        merchantOrgId: new Types.ObjectId(org.orgId),
        status: { $ne: MerchantProductStatus.ARCHIVED },
      })
      .sort({ name: 1 })
      .limit(200)
      .exec();
    return products.map((p) => this.toProductView(p));
  }

  async createProduct(
    ownerUserId: string,
    input: {
      name: string;
      sku?: string;
      category?: string;
      description?: string;
      unit?: string;
      stockQty?: number;
      reorderLevel?: number;
      costPriceRwf?: number;
      sellPriceRwf?: number;
    },
  ) {
    const org = await this.requireOrg(ownerUserId);
    const stockQty = Math.max(0, input.stockQty ?? 0);
    const product = await this.productModel.create({
      merchantOrgId: new Types.ObjectId(org.orgId),
      name: input.name.trim(),
      sku: input.sku?.trim().toUpperCase() || undefined,
      category: input.category?.trim(),
      description: input.description?.trim(),
      unit: input.unit?.trim() || 'unit',
      stockQty,
      reorderLevel: Math.max(0, input.reorderLevel ?? 0),
      costPriceRwf: Math.max(0, input.costPriceRwf ?? 0),
      sellPriceRwf: Math.max(0, input.sellPriceRwf ?? 0),
      status:
        stockQty <= 0
          ? MerchantProductStatus.OUT_OF_STOCK
          : MerchantProductStatus.ACTIVE,
    });

    if (stockQty > 0) {
      await this.movementModel.create({
        merchantOrgId: product.merchantOrgId,
        productId: product._id,
        type: MerchantStockMovementType.STOCK_IN,
        quantityDelta: stockQty,
        quantityAfter: stockQty,
        note: 'Initial stock',
        recordedByUserId: new Types.ObjectId(ownerUserId),
      });
    }

    return this.toProductView(product);
  }

  async updateProduct(
    ownerUserId: string,
    productId: string,
    patch: {
      name?: string;
      sku?: string;
      category?: string;
      description?: string;
      unit?: string;
      reorderLevel?: number;
      costPriceRwf?: number;
      sellPriceRwf?: number;
      status?: MerchantProductStatus;
    },
  ) {
    const org = await this.requireOrg(ownerUserId);
    const product = await this.productModel
      .findOne({
        _id: productId,
        merchantOrgId: new Types.ObjectId(org.orgId),
      })
      .exec();
    if (!product) throw new NotFoundException('Product not found');

    if (patch.name !== undefined) product.name = patch.name.trim();
    if (patch.sku !== undefined) {
      product.sku = patch.sku.trim() ? patch.sku.trim().toUpperCase() : undefined;
    }
    if (patch.category !== undefined) product.category = patch.category.trim();
    if (patch.description !== undefined) product.description = patch.description.trim();
    if (patch.unit !== undefined) product.unit = patch.unit.trim() || 'unit';
    if (patch.reorderLevel !== undefined) {
      product.reorderLevel = Math.max(0, patch.reorderLevel);
    }
    if (patch.costPriceRwf !== undefined) {
      product.costPriceRwf = Math.max(0, patch.costPriceRwf);
    }
    if (patch.sellPriceRwf !== undefined) {
      product.sellPriceRwf = Math.max(0, patch.sellPriceRwf);
    }
    if (patch.status !== undefined) product.status = patch.status;

    await product.save();
    return this.toProductView(product);
  }

  async recordMovement(
    ownerUserId: string,
    input: {
      productId: string;
      type: MerchantStockMovementType;
      quantity: number;
      note?: string;
    },
  ) {
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    const org = await this.requireOrg(ownerUserId);
    const product = await this.productModel
      .findOne({
        _id: input.productId,
        merchantOrgId: new Types.ObjectId(org.orgId),
      })
      .exec();
    if (!product) throw new NotFoundException('Product not found');

    const delta = this.deltaForType(input.type, input.quantity);
    const nextQty = product.stockQty + delta;
    if (nextQty < 0) {
      throw new BadRequestException(
        `Insufficient stock (${product.stockQty} ${product.unit} available)`,
      );
    }

    product.stockQty = nextQty;
    product.status =
      nextQty <= 0
        ? MerchantProductStatus.OUT_OF_STOCK
        : product.status === MerchantProductStatus.ARCHIVED
          ? product.status
          : MerchantProductStatus.ACTIVE;
    await product.save();

    const movement = await this.movementModel.create({
      merchantOrgId: product.merchantOrgId,
      productId: product._id,
      type: input.type,
      quantityDelta: delta,
      quantityAfter: nextQty,
      note: input.note?.trim(),
      recordedByUserId: new Types.ObjectId(ownerUserId),
    });

    return {
      product: this.toProductView(product),
      movement: this.toMovementView(movement, product.name),
    };
  }

  async listMovements(ownerUserId: string, productId?: string) {
    const org = await this.requireOrg(ownerUserId);
    const filter: Record<string, unknown> = {
      merchantOrgId: new Types.ObjectId(org.orgId),
    };
    if (productId) filter.productId = new Types.ObjectId(productId);

    const movements = await this.movementModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    const productIds = [...new Set(movements.map((m) => m.productId.toString()))];
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .select({ name: 1 })
      .exec();
    const nameById = new Map(products.map((p) => [p._id.toString(), p.name]));

    return movements.map((m) =>
      this.toMovementView(m, nameById.get(m.productId.toString())),
    );
  }

  async inventorySummary(ownerUserId: string) {
    const org = await this.requireOrg(ownerUserId);
    const orgId = new Types.ObjectId(org.orgId);
    const products = await this.productModel
      .find({
        merchantOrgId: orgId,
        status: { $ne: MerchantProductStatus.ARCHIVED },
      })
      .exec();

    const skuCount = products.length;
    const outOfStock = products.filter((p) => p.stockQty <= 0).length;
    const lowStock = products.filter(
      (p) => p.stockQty > 0 && p.stockQty <= p.reorderLevel,
    ).length;
    const stockValueRwf = products.reduce(
      (sum, p) => sum + p.stockQty * p.costPriceRwf,
      0,
    );

    return { skuCount, outOfStock, lowStock, stockValueRwf };
  }

  private deltaForType(type: MerchantStockMovementType, quantity: number): number {
    switch (type) {
      case MerchantStockMovementType.STOCK_IN:
      case MerchantStockMovementType.RETURN:
        return quantity;
      case MerchantStockMovementType.SALE:
      case MerchantStockMovementType.WRITE_OFF:
        return -quantity;
      case MerchantStockMovementType.ADJUSTMENT:
        // Explicit corrections that reduce counted stock (use STOCK_IN to increase).
        return -quantity;
      default:
        throw new BadRequestException('Unknown movement type');
    }
  }

  private async requireOrg(ownerUserId: string) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) throw new NotFoundException('Merchant organization not found');
    return org;
  }

  private toProductView(product: MerchantProductDocument) {
    return {
      id: product._id.toString(),
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      unit: product.unit,
      stockQty: product.stockQty,
      reorderLevel: product.reorderLevel,
      costPriceRwf: product.costPriceRwf,
      sellPriceRwf: product.sellPriceRwf,
      status: product.status,
      lowStock:
        product.stockQty > 0 && product.stockQty <= product.reorderLevel,
      createdAt: product.createdAt?.toISOString(),
    };
  }

  private toMovementView(
    movement: MerchantStockMovementDocument,
    productName?: string,
  ) {
    return {
      id: movement._id.toString(),
      productId: movement.productId.toString(),
      productName,
      type: movement.type,
      quantityDelta: movement.quantityDelta,
      quantityAfter: movement.quantityAfter,
      note: movement.note,
      createdAt: movement.createdAt?.toISOString(),
    };
  }
}
