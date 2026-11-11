import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as notificationsController from './notifications.controller.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', notificationsController.getNotifications);
