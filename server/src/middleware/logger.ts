import { Request, Response, NextFunction } from 'express';

const SLOW_THRESHOLD_MS = 200;

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const entry = {
      timestamp: new Date().toISOString(),
      method:    req.method,
      path:      req.path,
      status:    res.statusCode,
      duration_ms: duration,
    };

    if (res.statusCode >= 500) {
      console.error(JSON.stringify({ ...entry, level: 'error' }));
    } else if (res.statusCode >= 400) {
      console.warn(JSON.stringify({ ...entry, level: 'warn' }));
    } else if (duration > SLOW_THRESHOLD_MS) {
      console.warn(JSON.stringify({ ...entry, level: 'warn', alert: 'slow_request' }));
    } else {
      console.log(JSON.stringify({ ...entry, level: 'info' }));
    }
  });

  next();
};
