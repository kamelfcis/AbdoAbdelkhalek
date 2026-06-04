export function log(msg: string, data?: unknown): void {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[${ts}] ${msg}`, typeof data === 'object' ? JSON.stringify(data, null, 0).slice(0, 500) : data);
  } else {
    console.log(`[${ts}] ${msg}`);
  }
}

export function error(msg: string, err?: unknown): void {
  const ts = new Date().toISOString();
  console.error(`[${ts}] ERROR: ${msg}`, err instanceof Error ? err.message : err);
}
