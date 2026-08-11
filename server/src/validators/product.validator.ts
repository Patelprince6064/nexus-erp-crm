import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU code must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be a positive number'),
  currentStock: z.number().int().nonnegative('Current stock cannot be negative').default(0),
  minimumStockAlert: z.number().int().nonnegative('Minimum stock alert must be >= 0').default(10),
  warehouseLocation: z.string().min(2, 'Warehouse location is required'),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.string().optional().transform((val) => (val !== undefined ? val === 'true' : undefined)),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
