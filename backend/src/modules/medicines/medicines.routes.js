import { Router } from 'express';
import * as medicinesController from './medicines.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

export const medicinesRouter = Router();

// Read is allowed for all staff roles (Cashier needs to search medicines for POS sales)
medicinesRouter.get('/', authenticate, medicinesController.listMedicines);
medicinesRouter.get('/:id', authenticate, medicinesController.getMedicine);

// Catalogue mutations restricted to Admin and Pharmacist
medicinesRouter.post('/', authenticate, authorize('ADMIN', 'PHARMACIST'), medicinesController.createMedicine);
medicinesRouter.patch('/:id', authenticate, authorize('ADMIN', 'PHARMACIST'), medicinesController.updateMedicine);
medicinesRouter.delete('/:id', authenticate, authorize('ADMIN', 'PHARMACIST'), medicinesController.deleteMedicine);
