import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as customersController from './customers.controller.js';

export const customersRouter = Router();

customersRouter.use(authenticate);

customersRouter.get('/', customersController.listCustomers);
customersRouter.get('/lookup', customersController.lookupCustomers);
customersRouter.get('/:id', customersController.getCustomerById);
customersRouter.post('/', authorize('ADMIN', 'PHARMACIST', 'CASHIER'), customersController.createCustomer);
customersRouter.patch('/:id', authorize('ADMIN', 'PHARMACIST'), customersController.updateCustomer);
customersRouter.post('/:id/payments', authorize('ADMIN', 'PHARMACIST', 'CASHIER'), customersController.recordLedgerPayment);
customersRouter.delete('/:id', authorize('ADMIN'), customersController.deleteCustomer);
