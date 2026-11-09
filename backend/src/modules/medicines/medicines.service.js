import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listMedicines({
  search,
  categoryId,
  isActive,
  lowStockOnly,
  page = 1,
  limit = 20
}) {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(isActive !== undefined && isActive !== '' ? { isActive: isActive === 'true' || isActive === true } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { genericName: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { manufacturer: { contains: search, mode: 'insensitive' } },
            { therapeuticClasses: { has: search } }
          ]
        }
      : {})
  };

  const [total, medicines] = await Promise.all([
    prisma.medicine.count({ where }),
    prisma.medicine.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        },
        batches: {
          where: {
            status: 'ACTIVE',
            currentQuantity: { gt: 0 },
            expiryDate: { gte: now }
          },
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
            currentQuantity: true,
            salePrice: true
          },
          orderBy: { expiryDate: 'asc' }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })
  ]);

  // Compute live available stock and low stock indicators
  const formattedMedicines = medicines.map((m) => {
    const totalAvailableStock = m.batches.reduce(
      (sum, b) => sum + b.currentQuantity,
      0
    );
    const isLowStock = totalAvailableStock <= m.minReorderLevel;
    const earliestExpiry = m.batches[0]?.expiryDate || null;

    const activeBatches = m.batches.map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      expiryDate: b.expiryDate,
      currentQuantity: b.currentQuantity,
      salePrice: Number(b.salePrice),
      mrp: b.mrp ? Number(b.mrp) : Math.round(Number(b.salePrice) * 1.15 * 100) / 100,
      status: b.status
    }));

    const earliestBatch = activeBatches[0] || null;
    const salePrice = earliestBatch ? earliestBatch.salePrice : 0;

    return {
      id: m.id,
      name: m.name,
      genericName: m.genericName,
      sku: m.sku,
      dosageForm: m.dosageForm,
      strength: m.strength,
      packageUnit: m.packageUnit,
      minReorderLevel: m.minReorderLevel,
      defaultTaxRate: Number(m.defaultTaxRate),
      therapeuticClasses: m.therapeuticClasses || [],
      manufacturer: m.manufacturer || null,
      isActive: m.isActive,
      category: m.category,
      totalAvailableStock,
      activeBatchCount: m.batches.length,
      earliestExpiry,
      salePrice,
      earliestBatch: earliestBatch ? earliestBatch.batchNumber : null,
      batches: activeBatches,
      isLowStock,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    };
  });

  const finalResults = lowStockOnly === 'true' || lowStockOnly === true
    ? formattedMedicines.filter((m) => m.isLowStock)
    : formattedMedicines;

  return {
    medicines: finalResults,
    pagination: {
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export async function getMedicineById(id) {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      category: true,
      batches: {
        orderBy: { expiryDate: 'asc' }
      }
    }
  });

  if (!medicine) {
    throw new AppError('Medicine not found', 404, 'NOT_FOUND');
  }

  const now = new Date();
  const eligibleBatches = medicine.batches.filter(
    (b) => b.status === 'ACTIVE' && b.currentQuantity > 0 && new Date(b.expiryDate) >= now
  );

  const totalAvailableStock = eligibleBatches.reduce(
    (sum, b) => sum + b.currentQuantity,
    0
  );

  return {
    ...medicine,
    defaultTaxRate: Number(medicine.defaultTaxRate),
    totalAvailableStock,
    isLowStock: totalAvailableStock <= medicine.minReorderLevel,
    batches: medicine.batches.map((b) => ({
      ...b,
      purchaseCost: Number(b.purchaseCost),
      salePrice: Number(b.salePrice),
      mrp: b.mrp ? Number(b.mrp) : null
    }))
  };
}

export async function createMedicine(data) {
  // Validate category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId }
  });
  if (!category) {
    throw new AppError('Selected category does not exist', 400, 'INVALID_CATEGORY');
  }

  // Enforce unique SKU
  const existingSku = await prisma.medicine.findUnique({
    where: { sku: data.sku.trim().toUpperCase() }
  });
  if (existingSku) {
    throw new AppError(`A medicine with SKU "${data.sku}" already exists`, 409, 'SKU_EXISTS');
  }

  return prisma.medicine.create({
    data: {
      categoryId: data.categoryId,
      name: data.name.trim(),
      genericName: data.genericName.trim(),
      sku: data.sku.trim().toUpperCase(),
      dosageForm: data.dosageForm.trim(),
      strength: data.strength.trim(),
      packageUnit: data.packageUnit.trim(),
      minReorderLevel: parseInt(data.minReorderLevel, 10) || 20,
      defaultTaxRate: data.defaultTaxRate !== undefined ? Number(data.defaultTaxRate) : 12.0,
      therapeuticClasses: Array.isArray(data.therapeuticClasses) ? data.therapeuticClasses : [],
      manufacturer: data.manufacturer ? data.manufacturer.trim() : null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  });
}

export async function updateMedicine(id, data) {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) {
    throw new AppError('Medicine not found', 404, 'NOT_FOUND');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!category) {
      throw new AppError('Selected category does not exist', 400, 'INVALID_CATEGORY');
    }
  }

  if (data.sku && data.sku.trim().toUpperCase() !== medicine.sku) {
    const existing = await prisma.medicine.findUnique({
      where: { sku: data.sku.trim().toUpperCase() }
    });
    if (existing) {
      throw new AppError(`Another medicine already uses SKU "${data.sku}"`, 409, 'SKU_EXISTS');
    }
  }

  return prisma.medicine.update({
    where: { id },
    data: {
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.genericName ? { genericName: data.genericName.trim() } : {}),
      ...(data.sku ? { sku: data.sku.trim().toUpperCase() } : {}),
      ...(data.dosageForm ? { dosageForm: data.dosageForm.trim() } : {}),
      ...(data.strength ? { strength: data.strength.trim() } : {}),
      ...(data.packageUnit ? { packageUnit: data.packageUnit.trim() } : {}),
      ...(data.minReorderLevel !== undefined ? { minReorderLevel: parseInt(data.minReorderLevel, 10) } : {}),
      ...(data.defaultTaxRate !== undefined ? { defaultTaxRate: Number(data.defaultTaxRate) } : {}),
      ...(data.therapeuticClasses !== undefined ? { therapeuticClasses: Array.isArray(data.therapeuticClasses) ? data.therapeuticClasses : [] } : {}),
      ...(data.manufacturer !== undefined ? { manufacturer: data.manufacturer ? data.manufacturer.trim() : null } : {}),
      ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {})
    },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  });
}

export async function deleteMedicine(id) {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      _count: {
        select: { batches: true, saleItems: true, purchaseItems: true }
      }
    }
  });

  if (!medicine) {
    throw new AppError('Medicine not found', 404, 'NOT_FOUND');
  }

  if (medicine._count.batches > 0 || medicine._count.saleItems > 0 || medicine._count.purchaseItems > 0) {
    throw new AppError(
      `Cannot delete medicine "${medicine.name}" because historical batches, purchases, or sales depend on it. Deactivate the medicine instead.`,
      400,
      'MEDICINE_HAS_HISTORY'
    );
  }

  await prisma.medicine.delete({ where: { id } });
  return { message: 'Medicine deleted successfully' };
}

export async function generateCsvTemplate() {
  const categories = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  });

  const categoryNames = categories.map((c) => c.name);
  const categoryNote = categoryNames.length > 0
    ? categoryNames.join(' | ')
    : 'None yet registered. Enter any category name and it will be created automatically!';

  const headers = [
    'Medicine Name',
    'Generic Composition',
    'Primary Category',
    'Secondary Indications',
    'SKU',
    'Dosage Form',
    'Strength',
    'Package Unit',
    'Min Reorder Level',
    'Default Tax Rate',
    'Manufacturer'
  ].join(',');

  const sampleRows = [
    'Dolo 650,Paracetamol 650mg,Analgesics & Antipyretics,"Fever, Pain Relief",DOLO-650,Tablet,650mg,Strip of 15,20,12.00,Micro Labs',
    'Augmentin 625 Duo,Amoxicillin + Clavulanic Acid,Antibiotics & Antimicrobials,"Bacterial Infection, Dental, Respiratory",AUG-625,Tablet,625mg,Strip of 10,20,12.00,GlaxoSmithKline',
    'Ecosprin 75,Aspirin,Cardiovascular & Antiplatelet,"Analgesic, Blood Thinner, Heart Attack Prevention",ECO-75,Tablet,75mg,Strip of 14,30,12.00,USV Private Limited'
  ].join('\n');

  const notes = [
    '',
    '# --- INSTRUCTIONS & REFERENCE ---',
    '# 1. Columns marked (Medicine Name, Generic Composition, Primary Category, SKU, Dosage Form, Strength, Package Unit) are required.',
    '# 2. Secondary Indications: enter comma-separated therapeutic tags (e.g. "Pain Relief, Fever").',
    '# 3. If a Primary Category does not exist, it will be automatically registered in the system (marked as needing description).',
    `# 4. Currently Registered Categories: ${categoryNote}`
  ].join('\n');

  return `${headers}\n${sampleRows}\n${notes}`;
}

export async function importMedicinesFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new AppError('No medicine records found in the import payload', 400, 'EMPTY_IMPORT');
  }

  const results = {
    totalProcessed: rows.length,
    created: 0,
    updated: 0,
    createdCategories: 0,
    errors: []
  };

  // Cache existing categories in memory
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map();
  allCategories.forEach((cat) => {
    categoryMap.set(cat.name.trim().toLowerCase(), cat);
  });

  for (let idx = 0; idx < rows.length; idx++) {
    const raw = rows[idx];
    const rowNum = idx + 2; // Accounting for 1-based index + header

    // Map flexible column names
    const name = (raw['Medicine Name'] || raw.name || '').trim();
    const genericName = (raw['Generic Composition'] || raw.genericName || '').trim();
    const primaryCategoryName = (raw['Primary Category'] || raw.category || raw.categoryName || '').trim();
    const sku = (raw['SKU'] || raw['SKU / Barcode'] || raw.sku || '').trim().toUpperCase();
    const dosageForm = (raw['Dosage Form'] || raw.dosageForm || 'Tablet').trim();
    const strength = (raw['Strength'] || raw.strength || 'Standard').trim();
    const packageUnit = (raw['Package Unit'] || raw.packageUnit || 'Pack').trim();
    const minReorderLevel = parseInt(raw['Min Reorder Level'] || raw.minReorderLevel, 10) || 20;
    const defaultTaxRate = parseFloat(raw['Default Tax Rate'] || raw.defaultTaxRate) || 12.0;
    const manufacturer = (raw['Manufacturer'] || raw.manufacturer || '').trim() || null;

    // Parse secondary tags
    let therapeuticClasses = [];
    const rawTags = raw['Secondary Indications'] || raw.therapeuticClasses || '';
    if (Array.isArray(rawTags)) {
      therapeuticClasses = rawTags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof rawTags === 'string' && rawTags.trim()) {
      therapeuticClasses = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    if (!name || !genericName || !primaryCategoryName || !sku) {
      results.errors.push({
        row: rowNum,
        sku: sku || 'N/A',
        name: name || 'N/A',
        error: 'Missing required field: Name, Generic Composition, Primary Category, and SKU are all mandatory.'
      });
      continue;
    }

    try {
      // Find or auto-create category
      const catKey = primaryCategoryName.toLowerCase();
      let category = categoryMap.get(catKey);

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: primaryCategoryName,
            description: null // Triggers 'needs_description' filter
          }
        });
        categoryMap.set(catKey, category);
        results.createdCategories++;
      }

      // Upsert medicine by SKU
      const existing = await prisma.medicine.findUnique({
        where: { sku }
      });

      if (existing) {
        await prisma.medicine.update({
          where: { sku },
          data: {
            name,
            genericName,
            categoryId: category.id,
            dosageForm,
            strength,
            packageUnit,
            minReorderLevel,
            defaultTaxRate,
            therapeuticClasses,
            manufacturer
          }
        });
        results.updated++;
      } else {
        await prisma.medicine.create({
          data: {
            name,
            genericName,
            sku,
            categoryId: category.id,
            dosageForm,
            strength,
            packageUnit,
            minReorderLevel,
            defaultTaxRate,
            therapeuticClasses,
            manufacturer
          }
        });
        results.created++;
      }
    } catch (err) {
      results.errors.push({
        row: rowNum,
        sku,
        name,
        error: err.message || 'Database write error'
      });
    }
  }

  return results;
}

export async function exportMedicinesToCsv() {
  const medicines = await prisma.medicine.findMany({
    include: {
      category: {
        select: { name: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  const headers = [
    'Medicine Name',
    'Generic Composition',
    'Primary Category',
    'Secondary Indications',
    'SKU',
    'Dosage Form',
    'Strength',
    'Package Unit',
    'Min Reorder Level',
    'Default Tax Rate',
    'Manufacturer',
    'Active Status'
  ].join(',');

  const rows = medicines.map((m) => {
    const secTags = (m.therapeuticClasses || []).join(', ');
    const escapeCsv = (str) => {
      if (!str) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    return [
      escapeCsv(m.name),
      escapeCsv(m.genericName),
      escapeCsv(m.category?.name || 'Unassigned'),
      escapeCsv(secTags),
      escapeCsv(m.sku),
      escapeCsv(m.dosageForm),
      escapeCsv(m.strength),
      escapeCsv(m.packageUnit),
      m.minReorderLevel,
      m.defaultTaxRate,
      escapeCsv(m.manufacturer || ''),
      m.isActive ? 'Active' : 'Inactive'
    ].join(',');
  });

  return `${headers}\n${rows.join('\n')}`;
}
