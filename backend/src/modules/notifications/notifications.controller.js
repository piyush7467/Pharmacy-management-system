import * as notificationsService from './notifications.service.js';

export async function getNotifications(req, res, next) {
  try {
    const data = await notificationsService.getSystemNotifications();

    res.status(200).json({
      success: true,
      data,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
