import { exportDatabase } from '../export/export-db.js';
import { exportAuth } from '../export/export-auth.js';
import { exportStorage } from '../export/export-storage.js';
import { uploadToR2 } from '../export/upload-r2.js';
import { replaceUrls } from '../export/replace-urls.js';
import { generatePrisma } from '../export/generate-prisma.js';
import { verifyMigration } from '../export/verify-migration.js';
import { log, error } from '../lib/logger.js';

const steps = process.argv.slice(2);
const skipR2 = steps.includes('--skip-r2');
const skipStorage = steps.includes('--skip-storage');

async function main(): Promise<void> {
  log('=== backup-all: full Supabase migration export ===');

  await exportDatabase();
  await exportAuth();

  if (!skipStorage) {
    await exportStorage();
    if (!skipR2) {
      await uploadToR2();
      await replaceUrls();
    }
  }

  await generatePrisma();
  await verifyMigration();

  log('=== backup-all complete ===');
}

main().catch((e) => {
  error('backup-all failed', e);
  process.exit(1);
});
