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
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { suppliersRouter } from './modules/suppliers/suppliers.routes.js';
import { medicinesRouter } from './modules/medicines/medicines.routes.js';
import { purchasesRouter } from './modules/purchases/purchases.routes.js';
import { salesRouter } from './modules/sales/sales.routes.js';
import { returnsRouter } from './modules/returns/returns.routes.js';
import { inventoryRouter } from './modules/inventory/inventory.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { auditRouter } from './modules/audit/audit.routes.js';

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
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/suppliers', suppliersRouter);
app.use('/api/v1/medicines', medicinesRouter);
app.use('/api/v1/purchases', purchasesRouter);
app.use('/api/v1/sales', salesRouter);
app.use('/api/v1/returns', returnsRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/audit-logs', auditRouter);

// -------------------------------------------------------------
// 404 CATCH-ALL
// -------------------------------------------------------------
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, 'RESOURCE_NOT_FOUND'));
});

// Centralized Error Handling
app.use(errorHandler);
