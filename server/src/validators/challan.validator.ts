import { z } from 'zod';
import { ChallanStatus } from '../types/enums';

export const challanItemInputSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format'),
  items: z.array(challanItemInputSchema).min(1, 'Challan must contain at least one item'),
  status: z.enum([ChallanStatus.DRAFT, ChallanStatus.CONFIRMED]).default(ChallanStatus.DRAFT),
  notes: z.string().optional().nullable(),
  taxPercentage: z.number().nonnegative().default(18), // 18% default GST
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid().optional(),
  items: z.array(challanItemInputSchema).min(1).optional(),
  notes: z.string().optional().nullable(),
  taxPercentage: z.number().nonnegative().optional(),
});

export const challanQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  status: z.nativeEnum(ChallanStatus).optional(),
  customerId: z.string().optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
