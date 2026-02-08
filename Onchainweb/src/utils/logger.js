/**
 * Conditional Logger Utility
 * 
 * Provides logging functions that only output in development mode or when debug is enabled.
 * In production, logs are suppressed to prevent leaking sensitive information
 * and reduce console noise.
 * 
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('Debug message');
 *   logger.error('Error message');
 *   logger.warn('Warning message');
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG === 'true';

export const logger = {
  /**
   * Debug logging - only in development or when debug is enabled
   */
  debug: (...args) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },
  
  /**
   * Info logging - only in development or when debug is enabled
   */
  info: (...args) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  },
  
  /**
   * Warning logging - always logged
   */
  warn: (...args) => {
    console.warn(...args);
  },
  
  /**
   * Error logging - always logged
   * In production, also sends to error tracking service
   */
  error: (...args) => {
    console.error(...args);
    // TODO: Integrate with error tracking service (e.g., Sentry)
    // if (!isDevelopment) {
    //   sendToErrorTracking(args);
    // }
  },
  
  /**
   * Backward compatibility: log() maps to debug()
   */
  log: (...args) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  }
};
