import { z } from 'zod';
import * as medicinesService from './medicines.service.js';

const medicineSchema = z.object({
  categoryId: z.string().uuid('Valid category ID required'),
  name: z.string().min(2, 'Medicine name must be at least 2 characters').max(200),
  genericName: z.string().min(2, 'Generic composition must be at least 2 characters').max(200),
  sku: z.string().min(2, 'SKU barcode must be at least 2 characters').max(50),
  dosageForm: z.string().min(1, 'Dosage form is required (e.g. Tablet, Syrup)'),
  strength: z.string().min(1, 'Strength is required (e.g. 500mg, 10ml)'),
  packageUnit: z.string().min(1, 'Package unit is required (e.g. Strip of 10)'),
  minReorderLevel: z.coerce.number().int().min(0, 'Reorder level cannot be negative').default(20),
  defaultTaxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100).default(12.0),
  therapeuticClasses: z.array(z.string()).default([]),
  manufacturer: z.string().max(150).optional().nullable(),
  isActive: z.boolean().default(true)
});

export async function listMedicines(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { search, categoryId, isActive, lowStockOnly } = req.query;

    const result = await medicinesService.listMedicines({
      search,
      categoryId,
      isActive,
      lowStockOnly,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result.medicines,
      meta: {
        requestId: req.id,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMedicine(req, res, next) {
  try {
    const { id } = req.params;
    const medicine = await medicinesService.getMedicineById(id);

    return res.status(200).json({
      success: true,
      data: { medicine },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function createMedicine(req, res, next) {
  try {
    const input = medicineSchema.parse(req.body);
    const medicine = await medicinesService.createMedicine(input);

    return res.status(201).json({
      success: true,
      data: { medicine },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMedicine(req, res, next) {
  try {
    const { id } = req.params;
    const input = medicineSchema.partial().parse(req.body);
    const medicine = await medicinesService.updateMedicine(id, input);

    return res.status(200).json({
      success: true,
      data: { medicine },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMedicine(req, res, next) {
  try {
    const { id } = req.params;
    const result = await medicinesService.deleteMedicine(id);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadTemplate(req, res, next) {
  try {
    const csvContent = await medicinesService.generateCsvTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pharmaflow_medicine_import_template.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function exportMedicines(req, res, next) {
  try {
    const csvContent = await medicinesService.exportMedicinesToCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pharmaflow_active_medicines_catalog.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function importMedicines(req, res, next) {
  try {
    const rows = req.body.rows;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_IMPORT_PAYLOAD', message: 'Payload must contain a "rows" array of medicine objects.' }
      });
    }

    const summary = await medicinesService.importMedicinesFromRows(rows);
    return res.status(200).json({
      success: true,
      data: summary,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}
