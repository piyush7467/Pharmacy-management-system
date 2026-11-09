import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as returnsController from './returns.controller.js';

export const returnsRouter = Router();

returnsRouter.use(authenticate);

returnsRouter.get('/', returnsController.listReturns);
returnsRouter.get('/:id', returnsController.getReturnById);
returnsRouter.post('/', authorize('ADMIN', 'PHARMACIST'), returnsController.createReturn);
