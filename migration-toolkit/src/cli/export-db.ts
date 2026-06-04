import { exportDatabase } from '../export/export-db.js';
import { log, error } from '../lib/logger.js';

log('export-db started');
exportDatabase().catch((e) => { error('export-db failed', e); process.exit(1); });
