import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../../domains/shared/auth/jwt.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      /* ignore invalid optional token */
    }
  }
  next();
}

export function requireCoach(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user?.isCoach) {
    res.status(403).json({ error: 'Coach access required' });
    return;
  }
  next();
}
