import { z } from 'zod';
import * as authService from './auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../../utils/token.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);
    const { user, accessToken, rawRefreshToken } = await authService.login(input);

    setRefreshTokenCookie(res, rawRefreshToken);

    return res.status(200).json({
      success: true,
      data: { user, accessToken },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    const { user, accessToken, newRawRefreshToken } = await authService.refreshSession(rawRefreshToken);

    setRefreshTokenCookie(res, newRawRefreshToken);

    return res.status(200).json({
      success: true,
      data: { user, accessToken },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    await authService.logout(rawRefreshToken);

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const { id, email, fullName, role, isActive } = req.user;
    return res.status(200).json({
      success: true,
      data: {
        user: { id, email, fullName, role, isActive }
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.requestPasswordReset(email);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const input = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(input);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const input = updateProfileSchema.parse(req.body);
    const result = await authService.updateProfile(req.user.id, input);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const input = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.user.id, input);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}
