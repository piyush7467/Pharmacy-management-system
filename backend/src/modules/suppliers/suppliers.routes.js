import { Router } from 'express';
import * as suppliersController from './suppliers.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

export const suppliersRouter = Router();

// Read is allowed for Admin and Pharmacist (Cashier has no access to supply chain pricing)
suppliersRouter.get('/', authenticate, authorize('ADMIN', 'PHARMACIST'), suppliersController.listSuppliers);
suppliersRouter.get('/:id', authenticate, authorize('ADMIN', 'PHARMACIST'), suppliersController.getSupplier);

// Supplier mutations are restricted to ADMIN
suppliersRouter.post('/', authenticate, authorize('ADMIN'), suppliersController.createSupplier);
suppliersRouter.patch('/:id', authenticate, authorize('ADMIN'), suppliersController.updateSupplier);
suppliersRouter.delete('/:id', authenticate, authorize('ADMIN'), suppliersController.deleteSupplier);
