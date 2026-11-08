import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

export const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key']
  })
);

// Body and Cookie Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// Correlation Request ID
app.use(requestIdMiddleware);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms [reqId: :res[x-request-id]]'));
}

// -------------------------------------------------------------
// HEALTHCHECK ROUTE
// -------------------------------------------------------------
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      uptime: process.uptime(),
      service: 'PharmaPulse Backend API',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    },
    meta: {
      requestId: req.id,
      timestamp: new Date().toISOString()
    }
  });
});

// -------------------------------------------------------------
// MODULE ROUTERS
// -------------------------------------------------------------
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

// -------------------------------------------------------------
// 404 CATCH-ALL
// -------------------------------------------------------------
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, 'RESOURCE_NOT_FOUND'));
});

// Centralized Error Handling
app.use(errorHandler);
