export function isPoolerError(err: unknown): boolean {
  if (err instanceof Error && err.name === 'PrismaClientInitializationError') {
    return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('tenant/user') ||
    msg.includes('ENOTFOUND') ||
    msg.includes("Can't reach database") ||
    msg.includes("Can't reach database server") ||
    msg.includes('ECONNREFUSED')
  );
}
