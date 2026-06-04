/**
 * Imports auth users from backup/auth/users.json.
 * Sets a random temporary password — users must use "forgot password" after cutover.
 */
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const prisma = new PrismaClient();

interface AuthExport {
  users: {
    id: string;
    email: string;
    raw_user_meta_data?: { full_name?: string; phone?: string; is_coach?: boolean };
  }[];
}

async function main(): Promise<void> {
  const path = resolve(root, 'backup/auth/users.json');
  const raw = await readFile(path, 'utf8');
  const data = JSON.parse(raw) as AuthExport;
  const tempPassword = randomBytes(16).toString('hex');
  const hash = await bcrypt.hash(tempPassword, 12);

  for (const u of data.users) {
    if (!u.email) continue;
    const meta = u.raw_user_meta_data || {};
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        email: u.email.toLowerCase(),
        password: hash,
        fullName: meta.full_name || null,
        phone: meta.phone || null,
        isCoach: Boolean(meta.is_coach),
      },
      update: {
        email: u.email.toLowerCase(),
        fullName: meta.full_name || null,
        phone: meta.phone || null,
      },
    });
  }

  console.log(`Migrated ${data.users.length} users. Temporary password for all: (set via admin reset)`);
  await prisma.$disconnect();
}

main().catch(console.error);
