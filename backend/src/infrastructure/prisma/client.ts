import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './database-url.js';

export const prisma = new PrismaClient({
  datasources: {
    db: { url: getDatabaseUrl() },
  },
});
