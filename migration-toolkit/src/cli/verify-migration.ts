import { verifyMigration } from '../export/verify-migration.js';
import { error } from '../lib/logger.js';

verifyMigration().catch((e) => { error('verify-migration failed', e); process.exit(1); });
