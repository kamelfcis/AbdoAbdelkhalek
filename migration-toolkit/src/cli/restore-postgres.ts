import { restorePostgres } from '../export/restore-postgres.js';
import { error } from '../lib/logger.js';

restorePostgres().catch((e) => { error('restore-postgres failed', e); process.exit(1); });
