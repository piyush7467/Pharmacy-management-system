import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listCategories({ search, page = 1, limit = 50 }) {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {};

  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { medicines: true }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })
  ]);

  return {
    categories: categories.map((c) => ({
      ...c,
      medicineCount: c._count.medicines
    })),
    pagination: {
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { medicines: true }
      }
    }
  });

  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }

  return {
    ...category,
    medicineCount: category._count.medicines
  };
}

export async function createCategory({ name, description }) {
  const trimmedName = name.trim();

  const existing = await prisma.category.findUnique({
    where: { name: trimmedName }
  });

  if (existing) {
    throw new AppError('A category with this name already exists', 409, 'CATEGORY_EXISTS');
  }

  return prisma.category.create({
    data: {
      name: trimmedName,
      description: description?.trim() || null
    }
  });
}

export async function updateCategory(id, { name, description }) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }

  if (name && name.trim() !== category.name) {
    const existing = await prisma.category.findUnique({
      where: { name: name.trim() }
    });
    if (existing) {
      throw new AppError('Another category already uses this name', 409, 'CATEGORY_EXISTS');
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {})
    }
  });
}

export async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { medicines: true }
      }
    }
  });

  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }

  if (category._count.medicines > 0) {
    throw new AppError(
      `Cannot delete category "${category.name}" because it contains ${category._count.medicines} medicine records. Please reassign or delete the medicines first.`,
      400,
      'CATEGORY_NOT_EMPTY'
    );
  }

  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted successfully' };
}
