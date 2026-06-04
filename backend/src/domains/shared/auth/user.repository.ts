import bcrypt from 'bcryptjs';
import { prisma } from '../../../infrastructure/prisma/client.js';
import { isPoolerError } from '../../../infrastructure/prisma/db-errors.js';
import * as rest from '../../../infrastructure/supabase-rest/client.js';

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
  registeredFrom?: 'fitness' | 'squash';
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
    registeredFrom: input.registeredFrom ?? null,
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
