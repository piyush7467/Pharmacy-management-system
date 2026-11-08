import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listSuppliers({ search, status, page = 1, limit = 50 }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(status !== undefined && status !== '' ? { isActive: status === 'true' || status === true } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { contactPerson: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { taxNumber: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [total, suppliers] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchases: true }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })
  ]);

  return {
    suppliers: suppliers.map((s) => ({
      ...s,
      purchaseCount: s._count.purchases
    })),
    pagination: {
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export async function getSupplierById(id) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      _count: {
        select: { purchases: true }
      }
    }
  });

  if (!supplier) {
    throw new AppError('Supplier not found', 404, 'NOT_FOUND');
  }

  return {
    ...supplier,
    purchaseCount: supplier._count.purchases
  };
}

export async function createSupplier(data) {
  return prisma.supplier.create({
    data: {
      name: data.name.trim(),
      contactPerson: data.contactPerson?.trim() || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim()?.toLowerCase() || null,
      address: data.address?.trim() || null,
      taxNumber: data.taxNumber?.trim() || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    }
  });
}

export async function updateSupplier(id, data) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) {
    throw new AppError('Supplier not found', 404, 'NOT_FOUND');
  }

  return prisma.supplier.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.contactPerson !== undefined ? { contactPerson: data.contactPerson?.trim() || null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
      ...(data.email !== undefined ? { email: data.email?.trim()?.toLowerCase() || null } : {}),
      ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
      ...(data.taxNumber !== undefined ? { taxNumber: data.taxNumber?.trim() || null } : {}),
      ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {})
    }
  });
}

export async function deleteSupplier(id) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      _count: {
        select: { purchases: true }
      }
    }
  });

  if (!supplier) {
    throw new AppError('Supplier not found', 404, 'NOT_FOUND');
  }

  if (supplier._count.purchases > 0) {
    throw new AppError(
      `Cannot delete supplier "${supplier.name}" because it has ${supplier._count.purchases} linked purchase records. Deactivate the supplier instead.`,
      400,
      'SUPPLIER_HAS_PURCHASES'
    );
  }

  await prisma.supplier.delete({ where: { id } });
  return { message: 'Supplier deleted successfully' };
}
