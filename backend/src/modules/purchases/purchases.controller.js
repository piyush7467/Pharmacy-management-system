import * as purchaseService from './purchases.service.js';

export async function listPurchases(req, res, next) {
  try {
    const { search, supplierId, status, page, limit } = req.query;
    const result = await purchaseService.listPurchases({
      search,
      supplierId,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    });

    res.status(200).json({
      success: true,
      data: result.purchases,
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

export async function getPurchaseById(req, res, next) {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    res.status(200).json({
      success: true,
      data: purchase,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createPurchase(req, res, next) {
  try {
    const purchase = await purchaseService.createPurchase(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: purchase,
      meta: {
        message: `Purchase order ${purchase.purchaseNumber} created successfully`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function receivePurchase(req, res, next) {
  try {
    const context = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const purchase = await purchaseService.receivePurchase(
      req.params.id,
      req.body,
      req.user.id,
      context
    );

    res.status(200).json({
      success: true,
      data: purchase,
      meta: {
        message: `Purchase order ${purchase.purchaseNumber} received and stock intake completed`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelPurchase(req, res, next) {
  try {
    const context = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const purchase = await purchaseService.cancelPurchase(
      req.params.id,
      req.user.id,
      context
    );

    res.status(200).json({
      success: true,
      data: purchase,
      meta: {
        message: `Purchase order ${purchase.purchaseNumber} cancelled successfully`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
