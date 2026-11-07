import { randomUUID } from 'node:crypto';

export const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  req.id = incomingId && typeof incomingId === 'string' ? incomingId : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
