import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../../..');

config({ path: resolve(rootDir, '.env') });
config({ path: resolve(rootDir, '.env.local'), override: true });

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function resolveDatabaseUrl(): string {
  const explicitPooler = process.env.DATABASE_POOLER_URL;
  if (explicitPooler) return explicitPooler;

  const direct = requireEnv('DATABASE_URL');
  if (process.env.DATABASE_USE_DIRECT === 'true') return direct;

  const ref = optionalEnv('SUPABASE_PROJECT_REF', 'ugscjqusyjttihnfhtuk');
  const region = optionalEnv('SUPABASE_DB_REGION', 'eu-north-1');
  const poolerHost = optionalEnv(
    'SUPABASE_POOLER_HOST',
    `aws-0-${region}.pooler.supabase.com`
  );

  try {
    const u = new URL(direct.replace(/^postgresql:/i, 'postgres:'));
    const isSupabaseDirect =
      u.hostname.startsWith('db.') && u.hostname.endsWith('.supabase.co');
    if (isSupabaseDirect) {
      const password = decodeURIComponent(u.password);
      const user = `postgres.${ref}`;
      const encodedUser = encodeURIComponent(user);
      const encodedPass = encodeURIComponent(password);
      return `postgresql://${encodedUser}:${encodedPass}@${poolerHost}:5432/postgres`;
    }
  } catch {
    /* use direct URL as-is */
  }

  return direct;
}

export const env = {
  rootDir,
  supabaseUrl: optionalEnv('SUPABASE_URL', 'https://ugscjqusyjttihnfhtuk.supabase.co'),
  supabaseServiceKey: () => requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  databaseUrl: resolveDatabaseUrl,
  projectRef: optionalEnv('SUPABASE_PROJECT_REF', 'ugscjqusyjttihnfhtuk'),
  cdnBaseUrl: optionalEnv('CDN_BASE_URL', 'https://cdn.abdelrhmanabdelkhalek.com').replace(/\/$/, ''),
  r2: {
    accountId: () => requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: () => requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: () => requireEnv('R2_SECRET_ACCESS_KEY'),
    bucketName: optionalEnv('R2_BUCKET_NAME', 'abdelrhmanabdelkhalek-assets'),
  },
  exportPageSize: parseInt(optionalEnv('EXPORT_PAGE_SIZE', '1000'), 10),
  exportMaxConcurrency: parseInt(optionalEnv('EXPORT_MAX_CONCURRENCY', '4'), 10),
  storageDownloadConcurrency: parseInt(optionalEnv('STORAGE_DOWNLOAD_CONCURRENCY', '8'), 10),
  r2UploadConcurrency: parseInt(optionalEnv('R2_UPLOAD_CONCURRENCY', '10'), 10),
};

export const paths = {
  backup: resolve(rootDir, 'backup'),
  database: resolve(rootDir, 'backup/database'),
  databaseData: resolve(rootDir, 'backup/database/data'),
  auth: resolve(rootDir, 'backup/auth'),
  storage: resolve(rootDir, 'backup/storage'),
  migration: resolve(rootDir, 'migration/postgresql'),
};

export function maskSecret(value: string): string {
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
