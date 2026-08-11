import prisma from '../config/prisma';
import {
  CreateProductInput,
  UpdateProductInput,
  productQuerySchema,
} from '../validators/product.validator';
import { NotFoundError, ConflictError } from '../middleware/error.middleware';

export class ProductService {
  static async getProducts(query: any) {
    const parsedQuery = productQuerySchema.parse(query);
    const page = parsedQuery.page || 1;
    const limit = parsedQuery.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (parsedQuery.category) {
      where.category = parsedQuery.category;
    }

    if (parsedQuery.isActive !== undefined) {
      where.isActive = parsedQuery.isActive;
    }

    if (parsedQuery.search) {
      const search = parsedQuery.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { warehouseLocation: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 15,
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  static async createProduct(input: CreateProductInput) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: input.sku.trim().toUpperCase() },
    });

    if (existingSku) {
      throw new ConflictError(`Product with SKU '${input.sku}' already exists`);
    }

    const product = await prisma.product.create({
      data: {
        name: input.name,
        sku: input.sku.trim().toUpperCase(),
        category: input.category,
        unitPrice: input.unitPrice,
        currentStock: input.currentStock,
        minimumStockAlert: input.minimumStockAlert,
        warehouseLocation: input.warehouseLocation,
        isActive: input.isActive,
      },
    });

    return product;
  }

  static async updateProduct(id: string, input: UpdateProductInput) {
    await this.getProductById(id);

    if (input.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: input.sku.trim().toUpperCase(),
          NOT: { id },
        },
      });

      if (existingSku) {
        throw new ConflictError(`Product with SKU '${input.sku}' already exists`);
      }
    }

    const updateData: any = { ...input };
    if (input.sku) updateData.sku = input.sku.trim().toUpperCase();

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  static async deleteProduct(id: string) {
    await this.getProductById(id);

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return updated;
  }
}
