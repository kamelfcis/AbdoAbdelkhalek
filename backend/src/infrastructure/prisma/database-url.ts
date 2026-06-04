import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(backendRoot, '../.env') });
config({ path: resolve(backendRoot, '.env') });

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function withSsl(url: string): string {
  try {
    const u = new URL(url.replace(/^postgresql:/i, 'postgres:'));
    if (!u.searchParams.has('sslmode')) {
      u.searchParams.set('sslmode', 'require');
    }
    return u.toString().replace(/^postgres:/i, 'postgresql:');
  } catch {
    return url.includes('sslmode=') ? url : `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;
  }
}

export function resolveDatabaseUrl(): string {
  const explicitPooler = process.env.DATABASE_POOLER_URL;
  if (explicitPooler) return withSsl(explicitPooler);

  const direct = process.env.DATABASE_URL;
  if (!direct) {
    throw new Error('Missing required env: DATABASE_URL');
  }
  if (process.env.DATABASE_USE_DIRECT === 'true') return withSsl(direct);

  const ref = optionalEnv('SUPABASE_PROJECT_REF', 'ugscjqusyjttihnfhtuk');
  const region = optionalEnv('SUPABASE_DB_REGION', 'eu-north-1');
  const poolerHost = optionalEnv(
    'SUPABASE_POOLER_HOST',
    `aws-0-${region}.pooler.supabase.com`
  );
  const poolerPort = optionalEnv('SUPABASE_POOLER_PORT', '5432');

  try {
    const u = new URL(direct.replace(/^postgresql:/i, 'postgres:'));
    const isSupabaseDirect =
      u.hostname.startsWith('db.') && u.hostname.endsWith('.supabase.co');
    if (isSupabaseDirect) {
      const password = decodeURIComponent(u.password);
      const user = `postgres.${ref}`;
      const encodedUser = encodeURIComponent(user);
      const encodedPass = encodeURIComponent(password);
      return withSsl(
        `postgresql://${encodedUser}:${encodedPass}@${poolerHost}:${poolerPort}/postgres`
      );
    }
  } catch {
    /* use direct URL as-is */
  }

  return withSsl(direct);
}

let cachedUrl: string | undefined;

export function getDatabaseUrl(): string {
  if (!cachedUrl) cachedUrl = resolveDatabaseUrl();
  return cachedUrl;
}
