import type { Request, Response, NextFunction } from 'express';
import { rewriteMediaUrls } from '../utils/cdn-url.js';

export function cdnUrlResponseMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => originalJson(rewriteMediaUrls(body));
  next();
}
