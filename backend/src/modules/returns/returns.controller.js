import * as returnsService from './returns.service.js';

export async function createReturn(req, res, next) {
  try {
    const context = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const returnRecord = await returnsService.createReturn(req.body, req.user.id, context);

    res.status(201).json({
      success: true,
      data: returnRecord,
      meta: {
        message: `Customer return ${returnRecord.returnNumber} processed successfully`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listReturns(req, res, next) {
  try {
    const { search, saleId, page, limit } = req.query;

    const result = await returnsService.listReturns({
      search,
      saleId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20
    });

    res.status(200).json({
      success: true,
      data: result.returns,
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

export async function getReturnById(req, res, next) {
  try {
    const returnRecord = await returnsService.getReturnById(req.params.id);
    res.status(200).json({
      success: true,
      data: returnRecord,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
