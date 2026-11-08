import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as auditController from './audit.controller.js';

export const auditRouter = Router();

auditRouter.use(authenticate);
auditRouter.use(authorize('ADMIN'));

auditRouter.get('/', auditController.listAuditLogs);
