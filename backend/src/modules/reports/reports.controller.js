import * as reportsService from './reports.service.js';

export async function getSalesSummary(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const summary = await reportsService.getSalesSummary({ startDate, endDate });

    res.status(200).json({
      success: true,
      data: summary,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getStockValuation(req, res, next) {
  try {
    const valuation = await reportsService.getStockValuation();

    res.status(200).json({
      success: true,
      data: valuation,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getReconciliationAudit(req, res, next) {
  try {
    const audit = await reportsService.getReconciliationAudit();

    res.status(200).json({
      success: true,
      data: audit,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
