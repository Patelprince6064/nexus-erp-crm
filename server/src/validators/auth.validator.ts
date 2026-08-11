import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;

