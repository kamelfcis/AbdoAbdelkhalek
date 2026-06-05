import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../infrastructure/prisma/client.js';
import { isPoolerError } from '../../../infrastructure/prisma/db-errors.js';
import * as rest from '../../../infrastructure/supabase-rest/client.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export interface AuthUser {
  id: string;
  email: string;
  password: string | null;
  fullName: string | null;
  phone: string | null;
  isCoach: boolean;
}

const USER_SELECT =
  'id,email,password,full_name,phone,is_coach';

function mapRestUser(row: Record<string, unknown>): AuthUser {
  return {
    id: String(row.id),
    email: String(row.email),
    password: (row.password as string) ?? null,
    fullName: (row.full_name as string) ?? null,
    phone: (row.phone as string) ?? null,
    isCoach: Boolean(row.is_coach),
  };
}

function mapPrismaUser(user: {
  id: string;
  email: string;
  password: string | null;
  fullName: string | null;
  phone: string | null;
  isCoach: boolean;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    fullName: user.fullName,
    phone: user.phone,
    isCoach: user.isCoach,
  };
}

export function isBcryptHash(value: string): boolean {
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
}

export async function verifyPassword(plain: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const normalized = email.toLowerCase();
  try {
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    return user ? mapPrismaUser(user) : null;
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const row = await rest.restOne<Record<string, unknown>>(
      'users',
      `?email=eq.${encodeURIComponent(normalized)}&select=${USER_SELECT}`
    );
    return row ? mapRestUser(row) : null;
  }
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? mapPrismaUser(user) : null;
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const row = await rest.restOne<Record<string, unknown>>(
      'users',
      `?id=eq.${encodeURIComponent(id)}&select=${USER_SELECT}`
    );
    return row ? mapRestUser(row) : null;
  }
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  isCoach?: boolean;
  registeredFrom?: 'online_football' | 'squash' | 'fitness';
}

function normalizeRegisteredFrom(
  value?: 'online_football' | 'squash' | 'fitness' | null
): 'online_football' | 'squash' | null {
  if (!value) return null;
  if (value === 'fitness') return 'online_football';
  return value;
}

export async function createUser(input: CreateUserInput): Promise<AuthUser> {
  if (!isBcryptHash(input.password)) {
    throw new Error('Refusing to store plaintext password — hash with bcrypt before createUser()');
  }
  const email = input.email.toLowerCase();
  const data = {
    email,
    password: input.password,
    fullName: input.fullName,
    phone: input.phone ?? null,
    isCoach: input.isCoach ?? false,
    registeredFrom: normalizeRegisteredFrom(input.registeredFrom ?? null),
  };
  try {
    const user = await prisma.user.create({ data });
    return mapPrismaUser(user);
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    const row = await rest.restCreate<Record<string, unknown>>('users', {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      phone: data.phone,
      is_coach: data.isCoach,
      registered_from: data.registeredFrom,
    });
    return mapRestUser(row);
  }
}

export function hashResetToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export interface ValidResetToken {
  id: string;
  userId: string;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(raw);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await invalidatePasswordResetTokens(userId);

  try {
    await prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    await rest.restCreate('password_reset_tokens', {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });
  }

  return raw;
}

async function lookupPasswordResetToken(tokenHash: string, now: Date): Promise<ValidResetToken | null> {
  try {
    const found = await rest.restOne<Record<string, unknown>>(
      'password_reset_tokens',
      `?token_hash=eq.${encodeURIComponent(tokenHash)}&expires_at=gt.${encodeURIComponent(now.toISOString())}&select=id,user_id`
    );
    return found
      ? { id: String(found.id), userId: String(found.user_id) }
      : null;
  } catch {
    return null;
  }
}

export async function verifyPasswordResetToken(raw: string): Promise<ValidResetToken | null> {
  const tokenHash = hashResetToken(raw);
  const now = new Date();

  try {
    const row = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, expiresAt: { gt: now } },
    });
    return row ? { id: row.id, userId: row.userId } : null;
  } catch (e) {
    if (!isPoolerError(e)) {
      return lookupPasswordResetToken(tokenHash, now);
    }
    return lookupPasswordResetToken(tokenHash, now);
  }
}

export async function invalidatePasswordResetToken(tokenId: string): Promise<void> {
  try {
    await prisma.passwordResetToken.delete({ where: { id: tokenId } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    await rest.restDelete('password_reset_tokens', tokenId);
  }
}

export async function invalidatePasswordResetTokens(userId: string): Promise<void> {
  try {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    await rest.restDeleteWhere(
      'password_reset_tokens',
      `user_id=eq.${encodeURIComponent(userId)}`
    );
  }
}

export async function updatePassword(userId: string, hashedPassword: string): Promise<void> {
  if (!isBcryptHash(hashedPassword)) {
    throw new Error('Refusing to store plaintext password — hash with bcrypt before updatePassword()');
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  } catch (e) {
    if (!isPoolerError(e)) throw e;
    await rest.restPatch('users', userId, { password: hashedPassword });
  }
}
