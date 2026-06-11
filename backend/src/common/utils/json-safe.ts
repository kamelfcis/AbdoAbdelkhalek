import { Prisma } from '@prisma/client';

export function jsonReplacer(_key: string, value: unknown): unknown {
  if (Prisma.Decimal.isDecimal(value)) {
    return value.toNumber();
  }
  return value;
}

export function toJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, jsonReplacer)) as T;
}
