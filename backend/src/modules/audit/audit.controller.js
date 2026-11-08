import * as auditService from './audit.service.js';

export async function listAuditLogs(req, res, next) {
  try {
    const { action, entityName, actorId, startDate, endDate, page, limit } = req.query;

    const result = await auditService.listAuditLogs({
      action,
      entityName,
      actorId,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 25
    });

    res.status(200).json({
      success: true,
      data: result.logs,
      meta: {
        pagination: result.pagination,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
