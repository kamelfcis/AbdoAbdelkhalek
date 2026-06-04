import { replaceUrls } from '../export/replace-urls.js';
import { error } from '../lib/logger.js';

replaceUrls().catch((e) => { error('replace-urls failed', e); process.exit(1); });
