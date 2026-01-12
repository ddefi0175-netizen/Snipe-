/**
 * Console Filter Utility
 * 
 * Filters out known third-party deprecation warnings from browser extensions
 * that we cannot control. These warnings are from wallet extensions (OKX, Trust, etc.)
 * that inject code into the page and use deprecated browser APIs.
 * 
 * WARNING FILTERED:
 * - "Deprecation warning: tabReply will be removed" (from injected.js)
 * - This comes from wallet browser extensions, not our code
 * 
 * We filter these to reduce console noise and avoid confusing developers
 * with warnings about code we don't control.
 */

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Known third-party warnings to filter
const FILTERED_WARNINGS = [
  /deprecation warning.*tabreply/i,
  /tabreply will be removed/i,
  /injected\.js.*deprecation/i,
];

// Known third-party errors to filter (optional - be careful with this)
const FILTERED_ERRORS = [
  // Add patterns here if needed
];

/**
 * Check if a message should be filtered
 */
const shouldFilter = (message, patterns) => {
  if (typeof message !== 'string') return false;
  return patterns.some(pattern => pattern.test(message));
};

/**
 * Install console filters
 * Call this early in your app initialization
 */
export const installConsoleFilters = () => {
  // Filter console.warn
  console.warn = (...args) => {
    const message = args.join(' ');
    if (!shouldFilter(message, FILTERED_WARNINGS)) {
      originalWarn.apply(console, args);
    } else if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_CONSOLE) {
      // In dev mode with debug flag, show filtered warnings with prefix
      originalWarn.apply(console, ['[FILTERED - Third-party]', ...args]);
    }
  };

  // Optionally filter console.error (be very careful with this)
  if (import.meta.env.VITE_FILTER_THIRD_PARTY_ERRORS === 'true') {
    console.error = (...args) => {
      const message = args.join(' ');
      if (!shouldFilter(message, FILTERED_ERRORS)) {
        originalError.apply(console, args);
      } else if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_CONSOLE) {
        originalError.apply(console, ['[FILTERED - Third-party]', ...args]);
      }
    };
  }

  if (import.meta.env.DEV) {
    console.log('[Console Filter] Third-party warning filters installed');
    console.log('[Console Filter] Filtering:', FILTERED_WARNINGS.map(p => p.toString()).join(', '));
  }
};

/**
 * Uninstall console filters (restore original behavior)
 */
export const uninstallConsoleFilters = () => {
  console.warn = originalWarn;
  console.error = originalError;
  
  if (import.meta.env.DEV) {
    console.log('[Console Filter] Filters removed');
  }
};

/**
 * Get list of filtered warning patterns
 */
export const getFilteredPatterns = () => {
  return {
    warnings: FILTERED_WARNINGS.map(p => p.toString()),
    errors: FILTERED_ERRORS.map(p => p.toString()),
  };
};

// Auto-install filters in production
if (!import.meta.env.DEV) {
  installConsoleFilters();
}
