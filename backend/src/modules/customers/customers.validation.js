import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  type: z.enum(['GENERAL', 'REGULAR', 'HOSPITAL_CLINIC', 'WHOLESALE_BULK', 'CORPORATE_TPA']).default('GENERAL'),
  companyName: z.string().max(150).optional().nullable().or(z.literal('')),
  taxNumber: z.string().max(50).optional().nullable().or(z.literal('')),
  drugLicenseNo: z.string().max(50).optional().nullable().or(z.literal('')),
  defaultDiscountPct: z.number().min(0).max(100).default(0),
  creditLimit: z.number().min(0).default(0),
  paymentTermsDays: z.number().int().min(0).default(0),
  address: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal(''))
});

export const updateCustomerSchema = createCustomerSchema.partial();
