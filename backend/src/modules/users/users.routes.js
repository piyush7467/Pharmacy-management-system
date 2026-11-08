import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

export const usersRouter = Router();

// Enforce server-side authentication and ADMIN-only authorization
usersRouter.use(authenticate, authorize('ADMIN'));

usersRouter.get('/', usersController.listStaff);
usersRouter.post('/', usersController.createStaff);
usersRouter.patch('/:id', usersController.updateStaff);
usersRouter.patch('/:id/status', usersController.toggleStatus);
usersRouter.delete('/:id', usersController.deleteStaff);
