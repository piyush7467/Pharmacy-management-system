import { z } from 'zod';
import * as suppliersService from './suppliers.service.js';

const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name must be at least 2 characters').max(150),
  contactPerson: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  taxNumber: z.string().max(50).optional().nullable(),
  isActive: z.boolean().default(true)
});

export async function listSuppliers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const { search, status } = req.query;

    const result = await suppliersService.listSuppliers({ search, status, page, limit });

    return res.status(200).json({
      success: true,
      data: result.suppliers,
      meta: {
        requestId: req.id,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getSupplier(req, res, next) {
  try {
    const { id } = req.params;
    const supplier = await suppliersService.getSupplierById(id);

    return res.status(200).json({
      success: true,
      data: { supplier },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function createSupplier(req, res, next) {
  try {
    const input = supplierSchema.parse(req.body);
    const supplier = await suppliersService.createSupplier(input);

    return res.status(201).json({
      success: true,
      data: { supplier },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSupplier(req, res, next) {
  try {
    const { id } = req.params;
    const input = supplierSchema.partial().parse(req.body);
    const supplier = await suppliersService.updateSupplier(id, input);

    return res.status(200).json({
      success: true,
      data: { supplier },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    const { id } = req.params;
    const result = await suppliersService.deleteSupplier(id);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}
