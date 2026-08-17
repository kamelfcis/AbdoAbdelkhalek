import { logger } from '../logging/logger.js';

function matchesPoolerError(err: unknown): boolean {
  if (err instanceof Error) {
    if (
      err.name === 'PrismaClientInitializationError' ||
      err.name === 'PrismaClientRustPanicError'
    ) {
      return true;
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('tenant/user') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('Connection timed out') ||
    msg.includes('connection timed out') ||
    msg.includes('server closed the connection') ||
    msg.includes('Server has closed the connection') ||
    msg.includes("Can't reach database") ||
    msg.includes("Can't reach database server") ||
    msg.includes('P1001') ||
    msg.includes('P1002') ||
    msg.includes('P1008') ||
    msg.includes('P1017')
  );
}

/** True when Prisma should fall back to PostgREST. Logs a warning; does not throw. */
export function isPoolerError(err: unknown): boolean {
  const matched = matchesPoolerError(err);
  if (matched) {
    logger.warn({
      event: 'prisma_rest_fallback',
      message: 'Prisma write/read falling back to REST after pooler error',
      error: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : undefined,
    });
  }
  return matched;
}
