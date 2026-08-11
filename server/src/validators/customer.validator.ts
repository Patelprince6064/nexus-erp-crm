import { z } from 'zod';
import { CustomerType, CustomerStatus } from '../types/enums';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  mobile: z.string().min(8, 'Mobile number must be at least 8 digits'),
  email: z.string().email('Invalid email address format'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.WHOLESALE),
  address: z.string().min(5, 'Full address is required'),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z.string().min(3, 'Follow-up note must be at least 3 characters'),
  followUpDate: z.string().min(1, 'Follow-up date is required'),
});

export const customerQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
