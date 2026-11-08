import { prisma } from '../config/prisma.js';
import { verifyAccessToken } from '../utils/token.js';
import { AppError } from './errorHandler.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded?.sub) {
    return next(new AppError('Invalid or expired access token', 401, 'UNAUTHORIZED'));
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub }
  });

  if (!user || user.deletedAt) {
    return next(new AppError('User account not found or has been deactivated', 401, 'UNAUTHORIZED'));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been suspended. Please contact administrator.', 403, 'ACCOUNT_SUSPENDED'));
  }

  req.user = user;
  next();
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
    }

    next();
  };
}
