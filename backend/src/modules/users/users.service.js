import argon2 from 'argon2';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listStaffUsers({ search, role, status, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(role ? { role } : {}),
    ...(status !== undefined && status !== '' ? { isActive: status === 'true' || status === true } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export async function createStaffUser({ fullName, email, password, role }) {
  // Enforce rule: Admin cannot create another Admin via normal staff management
  if (role === 'ADMIN') {
    throw new AppError('Cannot create an ADMIN account through staff management. Only PHARMACIST or CASHIER can be created.', 403, 'FORBIDDEN_ROLE_ASSIGNMENT');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser && !existingUser.deletedAt) {
    throw new AppError('A staff member with this email address already exists.', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });

  const newUser = await prisma.user.create({
    data: {
      fullName,
      email: normalizedEmail,
      passwordHash,
      role
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return newUser;
}

export async function updateStaffUser(id, { fullName, email, role }) {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user || user.deletedAt) {
    throw new AppError('Staff member not found.', 404, 'NOT_FOUND');
  }

  if (role && role === 'ADMIN' && user.role !== 'ADMIN') {
    throw new AppError('Cannot promote a user to ADMIN through staff management.', 403, 'FORBIDDEN_ROLE_ASSIGNMENT');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(fullName ? { fullName } : {}),
      ...(email ? { email: email.toLowerCase().trim() } : {}),
      ...(role ? { role } : {})
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });

  return updated;
}

export async function toggleStaffStatus(id, isActive, actingAdminId) {
  if (id === actingAdminId) {
    throw new AppError('You cannot suspend your own admin account.', 400, 'CANNOT_SUSPEND_SELF');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.deletedAt) {
    throw new AppError('Staff member not found.', 404, 'NOT_FOUND');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: Boolean(isActive) },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true
    }
  });

  // If suspended, invalidate all refresh tokens immediately
  if (!isActive) {
    await prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { isRevoked: true }
    });
  }

  return updated;
}

export async function softDeleteStaffUser(id, actingAdminId) {
  if (id === actingAdminId) {
    throw new AppError('You cannot delete your own admin account.', 400, 'CANNOT_DELETE_SELF');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.deletedAt) {
    throw new AppError('Staff member not found.', 404, 'NOT_FOUND');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    }),
    prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { isRevoked: true }
    })
  ]);

  return { message: 'Staff member account has been soft-deleted and sessions revoked.' };
}
