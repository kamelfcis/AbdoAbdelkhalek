type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, payload: Record<string, unknown>): void {
  const line = JSON.stringify({ level, time: new Date().toISOString(), ...payload });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (payload: Record<string, unknown>) => log('info', payload),
  warn: (payload: Record<string, unknown>) => log('warn', payload),
  error: (payload: Record<string, unknown>) => log('error', payload),
  debug: (payload: Record<string, unknown>) => log('debug', payload),
};
