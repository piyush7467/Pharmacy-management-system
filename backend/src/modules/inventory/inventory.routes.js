import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as inventoryController from './inventory.controller.js';

export const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get('/batches', inventoryController.listBatches);
inventoryRouter.get('/overview', inventoryController.getStockOverview);
inventoryRouter.get('/adjustments', inventoryController.listStockAdjustments);
inventoryRouter.post('/adjustments', authorize('ADMIN', 'PHARMACIST'), inventoryController.createStockAdjustment);
