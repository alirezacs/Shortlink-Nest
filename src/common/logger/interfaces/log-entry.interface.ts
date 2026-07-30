export interface LogEntry {
  context: string;

  message: string;

  level?: 'info' | 'warn' | 'error' | 'debug' | 'verbose';

  method?: string;

  url?: string;

  statusCode?: number;

  duration?: number;

  ip?: string;

  userId?: string;

  userEmail?: string;

  userAgent?: string;

  requestId?: string;

  trace?: string;

  meta?: Record<string, unknown>;
}