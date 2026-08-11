import prisma from '../config/prisma';
import { ChallanStatus, MovementType } from '../types/enums';
import {
  CreateChallanInput,
  UpdateChallanInput,
  challanQuerySchema,
} from '../validators/challan.validator';
import { NotFoundError, AppError } from '../middleware/error.middleware';

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CH-${year}-`;

    const latestChallan = await prisma.challan.findFirst({
      where: { challanNumber: { startsWith: prefix } },
      orderBy: { challanNumber: 'desc' },
    });

    if (!latestChallan) {
      return `${prefix}0001`;
    }

    const lastSeqStr = latestChallan.challanNumber.replace(prefix, '');
    const lastSeq = parseInt(lastSeqStr, 10);
    const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  static async getChallans(query: any) {
    const parsedQuery = challanQuerySchema.parse(query);
    const page = parsedQuery.page || 1;
    const limit = parsedQuery.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (parsedQuery.status) {
      where.status = parsedQuery.status;
    }

    if (parsedQuery.customerId) {
      where.customerId = parsedQuery.customerId;
    }

    if (parsedQuery.search) {
      const search = parsedQuery.search;
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true, email: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return {
      challans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true, warehouseLocation: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw new NotFoundError('Sales challan not found');
    }

    return challan;
  }

  static async createChallan(input: CreateChallanInput, userId: string) {
    // 1. Verify Customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // 2. Fetch all products referenced in items
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist
    for (const item of input.items) {
      if (!productMap.has(item.productId)) {
        throw new NotFoundError(`Product ID '${item.productId}' not found`);
      }
    }

    // 3. Calculate snapshots, subtotal, and tax
    let totalQuantity = 0;
    let subtotal = 0;

    const itemsData = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const itemSubtotal = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      };
    });

    const taxPercentage = input.taxPercentage ?? 18;
    const taxAmount = Math.round(subtotal * (taxPercentage / 100) * 100) / 100;
    const totalAmount = subtotal + taxAmount;
    const challanNumber = await this.generateChallanNumber();

    // 4. Handle creation logic depending on requested status
    if (input.status === ChallanStatus.CONFIRMED) {
      // Execute atomically inside transaction
      return await prisma.$transaction(async (tx) => {
        // Stock check
        for (const item of input.items) {
          const product = productMap.get(item.productId)!;
          if (product.currentStock < item.quantity) {
            throw new AppError(
              `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`,
              400
            );
          }
        }

        // Create confirmed challan
        const createdChallan = await tx.challan.create({
          data: {
            challanNumber,
            customerId: input.customerId,
            status: ChallanStatus.CONFIRMED,
            totalQuantity,
            subtotal,
            taxAmount,
            totalAmount,
            notes: input.notes || null,
            createdById: userId,
            items: {
              create: itemsData,
            },
          },
          include: {
            customer: true,
            items: true,
          },
        });

        // Deduct stock and record movement for each item
        for (const item of input.items) {
          const product = productMap.get(item.productId)!;
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan ${createdChallan.challanNumber}`,
              referenceId: createdChallan.challanNumber,
              createdById: userId,
            },
          });
        }

        return createdChallan;
      });
    }

    // Default DRAFT creation - NO stock reduction
    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: input.customerId,
        status: ChallanStatus.DRAFT,
        totalQuantity,
        subtotal,
        taxAmount,
        totalAmount,
        notes: input.notes || null,
        createdById: userId,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return challan;
  }

  static async updateChallan(id: string, input: UpdateChallanInput) {
    const existing = await this.getChallanById(id);

    if (existing.status !== ChallanStatus.DRAFT) {
      throw new AppError(`Cannot modify a sales challan that is already ${existing.status}`, 400);
    }

    if (input.items && input.items.length > 0) {
      // Re-calculate snapshot data and totals
      const productIds = input.items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalQuantity = 0;
      let subtotal = 0;

      const itemsData = input.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) throw new NotFoundError(`Product ID ${item.productId} not found`);
        const itemSubtotal = product.unitPrice * item.quantity;
        totalQuantity += item.quantity;
        subtotal += itemSubtotal;

        return {
          productId: product.id,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        };
      });

      const taxPercentage = input.taxPercentage ?? 18;
      const taxAmount = Math.round(subtotal * (taxPercentage / 100) * 100) / 100;
      const totalAmount = subtotal + taxAmount;

      return await prisma.$transaction(async (tx) => {
        await tx.challanItem.deleteMany({ where: { challanId: id } });

        const updated = await tx.challan.update({
          where: { id },
          data: {
            customerId: input.customerId || existing.customerId,
            notes: input.notes !== undefined ? input.notes : existing.notes,
            totalQuantity,
            subtotal,
            taxAmount,
            totalAmount,
            items: {
              create: itemsData,
            },
          },
          include: { customer: true, items: true },
        });

        return updated;
      });
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: {
        customerId: input.customerId || existing.customerId,
        notes: input.notes !== undefined ? input.notes : existing.notes,
      },
      include: { customer: true, items: true },
    });

    return updated;
  }

  static async confirmChallan(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // Fetch fresh challan with items and product details inside transaction
      const challan = await tx.challan.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!challan) {
        throw new NotFoundError('Sales challan not found');
      }

      if (challan.status === ChallanStatus.CONFIRMED) {
        throw new AppError('Sales challan is already confirmed', 400);
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw new AppError('Cannot confirm a cancelled sales challan', 400);
      }

      // CRITICAL CHECK: Verify stock for EVERY item before modifying ANY stock
      for (const item of challan.items) {
        if (item.product.currentStock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product '${item.productNameSnapshot}' (SKU: ${item.skuSnapshot}). Requested: ${item.quantity}, Available: ${item.product.currentStock}`,
            400
          );
        }
      }

      // All items pass stock check - update products and create stock movements OUT
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: item.product.currentStock - item.quantity },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: MovementType.OUT,
            reason: `Sales Challan ${challan.challanNumber}`,
            referenceId: challan.challanNumber,
            createdById: userId,
          },
        });
      }

      // Update status to CONFIRMED
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CONFIRMED },
        include: { customer: true, items: true },
      });

      return confirmedChallan;
    });
  }

  static async cancelChallan(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });

      if (!challan) {
        throw new NotFoundError('Sales challan not found');
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw new AppError('Challan is already cancelled', 400);
      }

      // If it was CONFIRMED, restore product inventory
      if (challan.status === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: item.product.currentStock + item.quantity },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.IN,
              reason: `Cancelled Sales Challan ${challan.challanNumber} - Restocked`,
              referenceId: challan.challanNumber,
              createdById: userId,
            },
          });
        }
      }

      const cancelledChallan = await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CANCELLED },
        include: { customer: true, items: true },
      });

      return cancelledChallan;
    });
  }
}
