import { prisma } from '../../config/prisma.js';

export async function listAuditLogs({
  action,
  entityName,
  actorId,
  startDate,
  endDate,
  page = 1,
  limit = 25
}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(action ? { action } : {}),
    ...(entityName ? { entityName } : {}),
    ...(actorId ? { actorId } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {})
          }
        }
      : {})
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
