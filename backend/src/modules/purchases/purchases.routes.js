import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as purchaseController from './purchases.controller.js';

export const purchasesRouter = Router();

// Require authentication for all purchase operations
purchasesRouter.use(authenticate);

// Read purchases (All roles)
purchasesRouter.get('/', purchaseController.listPurchases);
purchasesRouter.get('/:id', purchaseController.getPurchaseById);

// Create purchase order (ADMIN and PHARMACIST)
purchasesRouter.post('/', authorize('ADMIN', 'PHARMACIST'), purchaseController.createPurchase);

// Receive purchase goods into inventory batches (ADMIN and PHARMACIST)
purchasesRouter.post('/:id/receive', authorize('ADMIN', 'PHARMACIST'), purchaseController.receivePurchase);

// Cancel purchase order (ADMIN and PHARMACIST)
purchasesRouter.patch('/:id/cancel', authorize('ADMIN', 'PHARMACIST'), purchaseController.cancelPurchase);
