import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';

export const addTraceId = (req: any, _res: Response, next: NextFunction) => {
  req.traceId = randomUUID();
  console.log(`[${req.traceId}] Requesting url: ${req.url}`);
  next();
};
