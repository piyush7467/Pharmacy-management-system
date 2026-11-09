import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  generateAccessToken,
  generateOpaqueToken,
  hashToken
} from '../../utils/token.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user || user.deletedAt) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Your account has been suspended. Please contact administrator.', 403, 'ACCOUNT_SUSPENDED');
  }

  const isValidPassword = await argon2.verify(user.passwordHash, password);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email
  });

  const rawRefreshToken = generateOpaqueToken();
  const tokenHash = hashToken(rawRefreshToken);
  const familyId = randomUUID();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    },
    accessToken,
    rawRefreshToken
  };
}

export async function refreshSession(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new AppError('Refresh token required', 401, 'UNAUTHORIZED');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: true }
  });

  if (!storedToken) {
    throw new AppError('Invalid refresh session', 401, 'UNAUTHORIZED');
  }

  // Token reuse detection: if a revoked token is used, invalidate the whole session family
  if (storedToken.isRevoked) {
    await prisma.refreshToken.updateMany({
      where: { familyId: storedToken.familyId },
      data: { isRevoked: true }
    });
    throw new AppError('Security violation: token reuse detected. Please log in again.', 401, 'TOKEN_REUSE_DETECTED');
  }

  if (new Date() > storedToken.expiresAt) {
    throw new AppError('Refresh session expired', 401, 'SESSION_EXPIRED');
  }

  if (!storedToken.user || storedToken.user.deletedAt || !storedToken.user.isActive) {
    throw new AppError('Account is inactive or suspended', 403, 'ACCOUNT_INACTIVE');
  }

  // Rotate token: revoke current and issue a new one in the same family
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true }
  });

  const newRawRefreshToken = generateOpaqueToken();
  const newTokenHash = hashToken(newRawRefreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: storedToken.user.id,
      tokenHash: newTokenHash,
      familyId: storedToken.familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  const accessToken = generateAccessToken({
    sub: storedToken.user.id,
    role: storedToken.user.role,
    email: storedToken.user.email
  });

  return {
    user: {
      id: storedToken.user.id,
      email: storedToken.user.email,
      fullName: storedToken.user.fullName,
      role: storedToken.user.role
    },
    accessToken,
    newRawRefreshToken
  };
}

export async function logout(rawRefreshToken) {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true }
    });
  }
}

export async function requestPasswordReset(email) {
  const genericMessage = 'If your email is registered, you will receive password reset instructions shortly.';

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user || user.deletedAt || !user.isActive) {
    return { message: genericMessage };
  }

  const rawToken = generateOpaqueToken();
  const tokenHash = hashToken(rawToken);

  // Invalidate any previously issued unused reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
    }
  });

  await sendPasswordResetEmail({
    toEmail: user.email,
    toName: user.fullName,
    resetToken: rawToken
  });

  return { message: genericMessage };
}

export async function resetPassword({ token, newPassword }) {
  const tokenHash = hashToken(token);

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!resetRecord || !resetRecord.user || resetRecord.user.deletedAt) {
    throw new AppError('Invalid or expired password reset link.', 400, 'INVALID_RESET_TOKEN');
  }

  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() }
    }),
    // Invalidate all active refresh sessions to enforce re-login
    prisma.refreshToken.updateMany({
      where: { userId: resetRecord.userId },
      data: { isRevoked: true }
    })
  ]);

  return { message: 'Password has been successfully reset. Please log in with your new password.' };
}

export async function updateProfile(userId, { fullName }) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.deletedAt) {
    throw new AppError('User account not found', 404, 'USER_NOT_FOUND');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: fullName.trim()
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

  return { user: updated };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.deletedAt) {
    throw new AppError('User account not found', 404, 'USER_NOT_FOUND');
  }

  const isValid = await argon2.verify(user.passwordHash, currentPassword);
  if (!isValid) {
    throw new AppError('Current password does not match records', 400, 'INVALID_CURRENT_PASSWORD');
  }

  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  return { message: 'Account password changed successfully' };
}
