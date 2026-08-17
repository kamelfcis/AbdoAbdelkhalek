import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../../domains/shared/auth/jwt.js';
import { findUserById } from '../../domains/shared/auth/user.repository.js';

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

/** Re-reads `is_coach` from the database so JWT claims cannot stale-grant coach access. */
export async function requireCoach(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user?.sub) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const dbUser = await findUserById(req.user.sub);
    if (!dbUser?.isCoach) {
      res.status(403).json({ error: 'Coach access required' });
      return;
    }
    req.user.isCoach = true;
    next();
  } catch (err) {
    next(err);
  }
}

/** Coaches may subscribe any user; trainees may only subscribe themselves. */
export function allowSelfOrCoachSubscription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (user.isCoach) {
    next();
    return;
  }
  const body = req.body as Record<string, unknown>;
  const targetId = (body.userId ?? body.user_id) as string | undefined;
  if (targetId && targetId !== user.sub) {
    res.status(403).json({ error: 'You can only subscribe your own account' });
    return;
  }
  body.userId = user.sub;
  body.user_id = user.sub;
  next();
}
