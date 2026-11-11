import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

function generateCustomerCode(type) {
  const prefixMap = {
    GENERAL: 'WALK',
    REGULAR: 'REG',
    HOSPITAL_CLINIC: 'HOSP',
    WHOLESALE_BULK: 'BULK',
    CORPORATE_TPA: 'CORP'
  };
  const prefix = prefixMap[type] || 'CUST';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomSuffix}`;
}

export async function listCustomers({
  search,
  type,
  isActive,
  hasBalance,
  page = 1,
  limit = 25
}) {
  const skip = (page - 1) * limit;
  const where = {
    deletedAt: null
  };

  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true' || isActive === true;
  }

  if (type) {
    where.type = type;
  }

  if (hasBalance === 'true') {
    where.currentBalance = { gt: 0 };
  }

  if (search) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { customerCode: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { companyName: { contains: q, mode: 'insensitive' } },
      { taxNumber: { contains: q, mode: 'insensitive' } }
    ];
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { sales: true }
        }
      }
    })
  ]);

  return {
    customers: customers.map((c) => ({
      ...c,
      defaultDiscountPct: Number(c.defaultDiscountPct),
      creditLimit: Number(c.creditLimit),
      currentBalance: Number(c.currentBalance),
      totalSalesCount: c._count.sales
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function lookupCustomers({ query, limit = 10 }) {
  if (!query || query.trim().length === 0) {
    // Return top recent 10 active customers
    const recent = await prisma.customer.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });
    return recent.map((c) => ({
      id: c.id,
      customerCode: c.customerCode,
      name: c.name,
      phone: c.phone,
      type: c.type,
      companyName: c.companyName,
      taxNumber: c.taxNumber,
      defaultDiscountPct: Number(c.defaultDiscountPct),
      creditLimit: Number(c.creditLimit),
      currentBalance: Number(c.currentBalance),
      paymentTermsDays: c.paymentTermsDays
    }));
  }

  const q = query.trim();
  const customers = await prisma.customer.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { customerCode: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: limit,
    orderBy: { name: 'asc' }
  });

  return customers.map((c) => ({
    id: c.id,
    customerCode: c.customerCode,
    name: c.name,
    phone: c.phone,
    type: c.type,
    companyName: c.companyName,
    taxNumber: c.taxNumber,
    defaultDiscountPct: Number(c.defaultDiscountPct),
    creditLimit: Number(c.creditLimit),
    currentBalance: Number(c.currentBalance),
    paymentTermsDays: c.paymentTermsDays
  }));
}

export async function getCustomerById(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          createdAt: true
        }
      }
    }
  });

  if (!customer || customer.deletedAt) {
    throw new AppError('Customer profile not found', 404, 'CUSTOMER_NOT_FOUND');
  }

  return {
    ...customer,
    defaultDiscountPct: Number(customer.defaultDiscountPct),
    creditLimit: Number(customer.creditLimit),
    currentBalance: Number(customer.currentBalance)
  };
}

export async function createCustomer(data) {
  // Generate unique customer code
  let code = generateCustomerCode(data.type || 'GENERAL');
  let exists = await prisma.customer.findUnique({ where: { customerCode: code } });
  while (exists) {
    code = generateCustomerCode(data.type || 'GENERAL');
    exists = await prisma.customer.findUnique({ where: { customerCode: code } });
  }

  const customer = await prisma.customer.create({
    data: {
      customerCode: code,
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      type: data.type || 'GENERAL',
      companyName: data.companyName?.trim() || null,
      taxNumber: data.taxNumber?.trim() || null,
      drugLicenseNo: data.drugLicenseNo?.trim() || null,
      defaultDiscountPct: data.defaultDiscountPct || 0,
      creditLimit: data.creditLimit || 0,
      currentBalance: 0,
      paymentTermsDays: data.paymentTermsDays || 0,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      isActive: true
    }
  });

  return {
    ...customer,
    defaultDiscountPct: Number(customer.defaultDiscountPct),
    creditLimit: Number(customer.creditLimit),
    currentBalance: Number(customer.currentBalance)
  };
}

export async function updateCustomer(id, data) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new AppError('Customer profile not found', 404, 'CUSTOMER_NOT_FOUND');
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
      ...(data.email !== undefined && { email: data.email?.trim() || null }),
      ...(data.type && { type: data.type }),
      ...(data.companyName !== undefined && { companyName: data.companyName?.trim() || null }),
      ...(data.taxNumber !== undefined && { taxNumber: data.taxNumber?.trim() || null }),
      ...(data.drugLicenseNo !== undefined && { drugLicenseNo: data.drugLicenseNo?.trim() || null }),
      ...(data.defaultDiscountPct !== undefined && { defaultDiscountPct: data.defaultDiscountPct }),
      ...(data.creditLimit !== undefined && { creditLimit: data.creditLimit }),
      ...(data.paymentTermsDays !== undefined && { paymentTermsDays: data.paymentTermsDays }),
      ...(data.address !== undefined && { address: data.address?.trim() || null }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) })
    }
  });

  return {
    ...updated,
    defaultDiscountPct: Number(updated.defaultDiscountPct),
    creditLimit: Number(updated.creditLimit),
    currentBalance: Number(updated.currentBalance)
  };
}

export async function recordLedgerPayment(id, { amount, notes, paymentMethod = 'CASH' }, cashierId) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer || customer.deletedAt) {
    throw new AppError('Customer profile not found', 404, 'CUSTOMER_NOT_FOUND');
  }

  const payAmount = Number(amount);
  if (isNaN(payAmount) || payAmount <= 0) {
    throw new AppError('Payment amount must be a positive number', 400, 'INVALID_PAYMENT_AMOUNT');
  }

  const currentBal = Number(customer.currentBalance);
  const newBal = Math.max(0, Math.round((currentBal - payAmount) * 100) / 100);

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      currentBalance: newBal
    }
  });

  return {
    id: updated.id,
    name: updated.name,
    customerCode: updated.customerCode,
    previousBalance: currentBal,
    amountPaid: payAmount,
    newBalance: Number(updated.currentBalance),
    paymentMethod,
    notes: notes || null
  };
}

export async function deleteCustomer(id) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer || customer.deletedAt) {
    throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
  }

  await prisma.customer.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false
    }
  });

  return { id, message: 'Customer soft-deleted successfully' };
}
