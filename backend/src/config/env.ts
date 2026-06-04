import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(root, '../.env') });
config({ path: resolve(root, '.env') });

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const isProduction = process.env.NODE_ENV === 'production';

function resolveJwtSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET', devFallback: string): string {
  if (isProduction) return requireEnv(name);
  return process.env[name] || devFallback;
}

export const env = {
  port: parseInt(process.env.API_PORT || '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  supabaseUrl: (process.env.SUPABASE_URL || 'https://ugscjqusyjttihnfhtuk.supabase.co').replace(/\/$/, ''),
  supabaseServiceKey: () => requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  jwtSecret: resolveJwtSecret('JWT_SECRET', 'dev-secret-change-in-production'),
  jwtRefreshSecret: resolveJwtSecret('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
  jwtExpiresIn: '15m',
  refreshExpiresDays: 7,
  cdnBaseUrl: (process.env.CDN_BASE_URL || 'https://cdn.abdelrhmanabdelkhalek.com').replace(/\/$/, ''),
  /** Serve media from Cloudflare R2/CDN (not Supabase storage). */
  useCdn: process.env.USE_CDN === 'true',
  r2PublicUrl: (process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''),
  mediaBaseUrl: (() => {
    const r2 = (process.env.R2_PUBLIC_URL || process.env.MEDIA_BASE_URL || '').replace(/\/$/, '');
    if (process.env.USE_CDN === 'true') {
      if (r2) return r2;
      return (process.env.CDN_BASE_URL || 'https://cdn.abdelrhmanabdelkhalek.com').replace(/\/$/, '');
    }
    return r2;
  })(),
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'abdelrhmanabdelkhalek-assets',
  },
};
