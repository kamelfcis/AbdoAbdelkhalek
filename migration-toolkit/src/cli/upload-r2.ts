import { uploadToR2 } from '../export/upload-r2.js';
import { error } from '../lib/logger.js';

uploadToR2().catch((e) => { error('upload-r2 failed', e); process.exit(1); });
