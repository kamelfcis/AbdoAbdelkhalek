import { exportAuth } from '../export/export-auth.js';
import { error } from '../lib/logger.js';

exportAuth().catch((e) => { error('export-auth failed', e); process.exit(1); });
