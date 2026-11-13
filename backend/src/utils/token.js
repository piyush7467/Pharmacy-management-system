import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateAccessToken(payload) {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
}

export function generateOpaqueToken() {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function setRefreshTokenCookie(res, token) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    // Cross-site cookies between Vercel frontend and Render backend require secure=true and sameSite='none'
    secure: isProd ? true : env.COOKIE_SECURE,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearRefreshTokenCookie(res) {
  const isProd = env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd ? true : env.COOKIE_SECURE,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/v1/auth'
  });
}
