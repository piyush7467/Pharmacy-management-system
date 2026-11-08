import * as inventoryService from './inventory.service.js';

export async function listBatches(req, res, next) {
  try {
    const { search, medicineId, status, expiringWithinDays, page, limit } = req.query;

    const result = await inventoryService.listBatches({
      search,
      medicineId,
      status,
      expiringWithinDays,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 25
    });

    res.status(200).json({
      success: true,
      data: result.batches,
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

export async function getStockOverview(req, res, next) {
  try {
    const overview = await inventoryService.getStockOverview();
    res.status(200).json({
      success: true,
      data: overview,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createStockAdjustment(req, res, next) {
  try {
    const context = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const adjustment = await inventoryService.createStockAdjustment(req.body, req.user.id, context);

    res.status(201).json({
      success: true,
      data: adjustment,
      meta: {
        message: `Stock adjustment ${adjustment.adjustmentNumber} recorded successfully`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listStockAdjustments(req, res, next) {
  try {
    const { search, page, limit } = req.query;

    const result = await inventoryService.listStockAdjustments({
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    });

    res.status(200).json({
      success: true,
      data: result.adjustments,
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
