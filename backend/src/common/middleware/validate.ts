import type { Request, Response, NextFunction } from 'express';
import type { ZodType, ZodTypeDef } from 'zod';

export function validateBody<T>(schema: ZodType<T, ZodTypeDef, unknown>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body) as T;
    next();
  };
}
