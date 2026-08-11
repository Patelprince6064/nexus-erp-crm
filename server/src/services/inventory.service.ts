import prisma from '../config/prisma';
import { MovementType } from '../types/enums';
import {
  CreateStockMovementInput,
  inventoryMovementQuerySchema,
} from '../validators/inventory.validator';
import { NotFoundError, AppError } from '../middleware/error.middleware';

export class InventoryService {
  static async getLowStockProducts() {
    // Products where currentStock <= minimumStockAlert
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { currentStock: 'asc' },
    });

    const lowStockProducts = products.filter(
      (p) => p.currentStock <= p.minimumStockAlert
    );

    return lowStockProducts;
  }

  static async getStockMovements(query: any) {
    const parsedQuery = inventoryMovementQuerySchema.parse(query);
    const page = parsedQuery.page || 1;
    const limit = parsedQuery.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (parsedQuery.productId) {
      where.productId = parsedQuery.productId;
    }

    if (parsedQuery.movementType) {
      where.movementType = parsedQuery.movementType;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true, category: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      movements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async recordStockMovement(input: CreateStockMovementInput, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (input.movementType === MovementType.OUT) {
        if (input.quantity > product.currentStock) {
          throw new AppError(
            `Insufficient stock. Available stock: ${product.currentStock}, Requested quantity: ${input.quantity}`,
            400
          );
        }
      }

      const newStock =
        input.movementType === MovementType.IN
          ? product.currentStock + input.quantity
          : product.currentStock - input.quantity;

      // Update product current stock
      await tx.product.update({
        where: { id: input.productId },
        data: { currentStock: newStock },
      });

      // Insert stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          quantity: input.quantity,
          movementType: input.movementType,
          reason: input.reason,
          referenceId: input.referenceId || null,
          createdById: userId,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true, currentStock: true },
          },
        },
      });

      return movement;
    });
  }
}
