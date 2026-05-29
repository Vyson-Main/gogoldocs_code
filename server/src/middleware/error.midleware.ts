import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isProd = process.env.NODE_ENV === 'production';

  console.error(JSON.stringify({
    timestamp:  new Date().toISOString(),
    level:      'error',
    message:    err.message,
    path:       req.path,
    method:     req.method,
    stack:      isProd ? undefined : err.stack,  // never in prod
  }));

  res.status(500).json({
    error:   'Internal server error',
    stack:   isProd ? undefined : err.stack,     // never in prod
  });
};
