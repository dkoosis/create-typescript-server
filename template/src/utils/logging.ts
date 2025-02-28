// File: /projects/create-typescript-server/template/src/utils/logging.ts

/**
 * Logging utilities for the MCP server.
 * This file provides consistent logging patterns.
 */

/**
 * Log levels, in order of increasing severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * In-memory log storage
 */
const logs: string[] = [];

/**
 * Current log level
 */
let currentLogLevel: LogLevel = 'info';

/**
 * Log level order for filtering
 */
const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1,
  'warn': 2,
  'error': 3
};

/**
 * Set up logging with the specified minimum log level
 */
export function setupLogging(level: LogLevel = 'info'): void {
  currentLogLevel = level;
}

/**
 * Log a message at the specified level
 */
export function log(message: string, level: LogLevel = 'info'): void {
  // Skip if below current log level
  if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[currentLogLevel]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Store log in memory
  logs.push(formattedMessage);
  
  // Log to console
  const consoleMethod = level === 'debug' ? 'log' : level;
  console[consoleMethod](formattedMessage);
}

/**
 * Get all logs (useful for dev server)
 */
export function getLogs(): string[] {
  return [...logs];
}