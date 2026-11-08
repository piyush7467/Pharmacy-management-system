import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as salesController from './sales.controller.js';

export const salesRouter = Router();

salesRouter.use(authenticate);

salesRouter.get('/preview-fefo', salesController.previewFefo);
salesRouter.get('/', salesController.listSales);
salesRouter.get('/:id', salesController.getSaleById);
salesRouter.post('/', salesController.createSale);
