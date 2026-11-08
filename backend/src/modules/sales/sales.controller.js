import * as salesService from './sales.service.js';

export async function createSale(req, res, next) {
  try {
    const context = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const idempotencyKey = req.get('Idempotency-Key') || req.body.idempotencyKey;
    const payload = {
      ...req.body,
      idempotencyKey
    };

    const sale = await salesService.createSale(payload, req.user.id, context);

    res.status(201).json({
      success: true,
      data: sale,
      meta: {
        message: `Sale invoice ${sale.invoiceNumber} processed successfully`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listSales(req, res, next) {
  try {
    const { search, paymentMethod, status, cashierId, startDate, endDate, page, limit } = req.query;

    const result = await salesService.listSales({
      search,
      paymentMethod,
      status,
      cashierId,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    });

    res.status(200).json({
      success: true,
      data: result.sales,
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

export async function getSaleById(req, res, next) {
  try {
    const sale = await salesService.getSaleById(req.params.id);
    res.status(200).json({
      success: true,
      data: sale,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function previewFefo(req, res, next) {
  try {
    const { medicineId, quantity } = req.query;
    const preview = await salesService.previewFefoAllocation({ medicineId, quantity });
    res.status(200).json({
      success: true,
      data: preview,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
