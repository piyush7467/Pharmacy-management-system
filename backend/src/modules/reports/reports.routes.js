import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as reportsController from './reports.controller.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate);
reportsRouter.use(authorize('ADMIN', 'PHARMACIST'));

reportsRouter.get('/sales-summary', reportsController.getSalesSummary);
reportsRouter.get('/stock-valuation', reportsController.getStockValuation);
reportsRouter.get('/reconciliation', reportsController.getReconciliationAudit);
