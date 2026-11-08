import { z } from 'zod';
import * as categoriesService from './categories.service.js';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable()
});

export async function listCategories(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const { search } = req.query;

    const result = await categoriesService.listCategories({ search, page, limit });

    return res.status(200).json({
      success: true,
      data: result.categories,
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

export async function getCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoriesService.getCategoryById(id);

    return res.status(200).json({
      success: true,
      data: { category },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const input = categorySchema.parse(req.body);
    const category = await categoriesService.createCategory(input);

    return res.status(201).json({
      success: true,
      data: { category },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const input = categorySchema.partial().parse(req.body);
    const category = await categoriesService.updateCategory(id, input);

    return res.status(200).json({
      success: true,
      data: { category },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const result = await categoriesService.deleteCategory(id);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}
