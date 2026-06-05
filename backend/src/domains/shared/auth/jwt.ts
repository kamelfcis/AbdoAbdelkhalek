import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env.js';

const accessSignOptions: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };

export interface TokenPayload {
  sub: string;
  email: string;
  isCoach: boolean;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, accessSignOptions);
}

export function signRefreshToken(userId: string, expiresDays = env.refreshExpiresDays): string {
  const refreshOptions: SignOptions = {
    expiresIn: `${expiresDays}d` as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: userId, type: 'refresh' }, env.jwtRefreshSecret, refreshOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string };
}
