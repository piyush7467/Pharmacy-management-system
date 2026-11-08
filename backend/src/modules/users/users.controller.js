import { z } from 'zod';
import * as usersService from './users.service.js';

const createStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PHARMACIST', 'CASHIER'], {
    errorMap: () => ({ message: 'Staff role must be either PHARMACIST or CASHIER' })
  })
});

const updateStaffSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['PHARMACIST', 'CASHIER']).optional()
});

const toggleStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status boolean is required' })
});

export async function listStaff(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { search, role, status } = req.query;

    const result = await usersService.listStaffUsers({
      search,
      role,
      status,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result.users,
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

export async function createStaff(req, res, next) {
  try {
    const input = createStaffSchema.parse(req.body);
    const user = await usersService.createStaffUser(input);

    return res.status(201).json({
      success: true,
      data: { user },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const input = updateStaffSchema.parse(req.body);
    const user = await usersService.updateStaffUser(id, input);

    return res.status(200).json({
      success: true,
      data: { user },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = toggleStatusSchema.parse(req.body);
    const user = await usersService.toggleStaffStatus(id, isActive, req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStaff(req, res, next) {
  try {
    const { id } = req.params;
    const result = await usersService.softDeleteStaffUser(id, req.user.id);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}
