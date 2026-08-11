import { z } from 'zod';
import { MovementType } from '../types/enums';

export const createStockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Movement quantity must be a positive integer'),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().min(3, 'Reason for movement is required'),
  referenceId: z.string().optional().nullable(),
});

export const inventoryMovementQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  productId: z.string().optional(),
  movementType: z.nativeEnum(MovementType).optional(),
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
