import { uploadToR2Stream } from '../export/upload-r2-stream.js';
import { error } from '../lib/logger.js';

uploadToR2Stream().catch((e) => {
  error('upload-r2-stream failed', e);
  process.exit(1);
});
