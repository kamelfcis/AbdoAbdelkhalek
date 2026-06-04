import { generatePrisma } from '../export/generate-prisma.js';
import { error } from '../lib/logger.js';

generatePrisma().catch((e) => { error('generate-prisma failed', e); process.exit(1); });
