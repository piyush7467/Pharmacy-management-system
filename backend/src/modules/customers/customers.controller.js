import * as customersService from './customers.service.js';
import { createCustomerSchema, updateCustomerSchema } from './customers.validation.js';

export async function listCustomers(req, res, next) {
  try {
    const { search, type, isActive, hasBalance, page, limit } = req.query;

    const result = await customersService.listCustomers({
      search,
      type,
      isActive,
      hasBalance,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 25
    });

    res.status(200).json({
      success: true,
      data: result.customers,
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

export async function lookupCustomers(req, res, next) {
  try {
    const { q, limit } = req.query;
    const customers = await customersService.lookupCustomers({
      query: q,
      limit: limit ? parseInt(limit, 10) : 10
    });

    res.status(200).json({
      success: true,
      data: customers,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const customer = await customersService.getCustomerById(req.params.id);

    res.status(200).json({
      success: true,
      data: customer,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const validatedData = createCustomerSchema.parse(req.body);
    const customer = await customersService.createCustomer(validatedData);

    res.status(201).json({
      success: true,
      data: customer,
      meta: {
        message: `Customer ${customer.name} registered successfully with code ${customer.customerCode}`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const validatedData = updateCustomerSchema.parse(req.body);
    const customer = await customersService.updateCustomer(req.params.id, validatedData);

    res.status(200).json({
      success: true,
      data: customer,
      meta: {
        message: 'Customer profile updated successfully',
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function recordLedgerPayment(req, res, next) {
  try {
    const { amount, notes, paymentMethod } = req.body;
    const result = await customersService.recordLedgerPayment(
      req.params.id,
      { amount, notes, paymentMethod },
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        message: `Payment of ₹${result.amountPaid} recorded. New balance: ₹${result.newBalance}`,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const result = await customersService.deleteCustomer(req.params.id);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        message: result.message,
        requestId: req.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
