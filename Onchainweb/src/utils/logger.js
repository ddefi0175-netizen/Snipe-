/**
 * Conditional Logger Utility
 * 
 * Provides logging functions that only output in development mode.
 * In production, logs are suppressed to prevent leaking sensitive information
 * and reduce console noise.
 * 
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.log('Debug message');
 *   logger.error('Error message');
 *   logger.warn('Warning message');
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args) => {
    if (isDevelopment) console.error(...args);
    // In production, send to error tracking service
    // TODO: Integrate with error tracking service (e.g., Sentry)
  },
  warn: (...args) => {
    if (isDevelopment) console.warn(...args);
  },
  debug: (...args) => {
    if (isDevelopment) console.debug(...args);
  },
  info: (...args) => {
    if (isDevelopment) console.info(...args);
  }
};
