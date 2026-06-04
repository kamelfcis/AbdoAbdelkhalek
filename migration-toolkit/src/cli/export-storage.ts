import { exportStorage } from '../export/export-storage.js';
import { error } from '../lib/logger.js';

exportStorage().catch((e) => { error('export-storage failed', e); process.exit(1); });
