import { Router } from 'express';
import * as categoriesController from './categories.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

export const categoriesRouter = Router();

// Read is allowed for all staff roles (Admin, Pharmacist, Cashier)
categoriesRouter.get('/', authenticate, categoriesController.listCategories);
categoriesRouter.get('/:id', authenticate, categoriesController.getCategory);

// Mutations restricted to Admin and Pharmacist
categoriesRouter.post('/', authenticate, authorize('ADMIN', 'PHARMACIST'), categoriesController.createCategory);
categoriesRouter.patch('/:id', authenticate, authorize('ADMIN', 'PHARMACIST'), categoriesController.updateCategory);
categoriesRouter.delete('/:id', authenticate, authorize('ADMIN', 'PHARMACIST'), categoriesController.deleteCategory);
