type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const COLORS: Record<LogLevel, string> = {
  info: '\x1b[36m',  // cyan
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
  debug: '\x1b[90m', // gray
};
const RESET = '\x1b[0m';

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const log = (level: LogLevel, message: string, ...args: unknown[]): void => {
  const color = COLORS[level];
  const timestamp = formatTimestamp();
  const prefix = `${color}[${timestamp}] [${level.toUpperCase()}]${RESET}`;

  if (args.length > 0) {
    console[level === 'error' ? 'error' : 'log'](prefix, message, ...args);
  } else {
    console[level === 'error' ? 'error' : 'log'](prefix, message);
  }
};

export const logger = {
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, ...args);
    }
  },
};
