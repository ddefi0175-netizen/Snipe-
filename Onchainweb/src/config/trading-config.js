/**
 * Trading Configuration
 * 
 * Centralized configuration for trading levels and AI arbitrage settings.
 * These values provide defaults for the platform and can be overridden by admin settings.
 * 
 * TODO: In the future, these should be loaded from Firebase/Firestore to allow
 * dynamic configuration through the admin panel without code changes.
 */

/**
 * Default Binary Trading Levels
 * 
 * Each level defines the capital range, profit percentage, and duration.
 * Users can trade at levels they have access to (controlled by admin).
 * 
 * @type {Array<{level: number, minCapital: number, maxCapital: number, profit: number, duration: number}>}
 */
export const DEFAULT_TRADING_LEVELS = [
  { 
    level: 1, 
    minCapital: 100, 
    maxCapital: 19999, 
    profit: 18,        // 18% profit
    duration: 180      // 180 seconds (3 minutes)
  },
  { 
    level: 2, 
    minCapital: 20000, 
    maxCapital: 30000, 
    profit: 23,        // 23% profit
    duration: 360      // 360 seconds (6 minutes)
  },
  { 
    level: 3, 
    minCapital: 30001, 
    maxCapital: 50000, 
    profit: 33.5,      // 33.5% profit
    duration: 720      // 720 seconds (12 minutes)
  },
  { 
    level: 4, 
    minCapital: 50001, 
    maxCapital: 100000, 
    profit: 50,        // 50% profit
    duration: 1080     // 1080 seconds (18 minutes)
  },
  { 
    level: 5, 
    minCapital: 100001, 
    maxCapital: 300000, 
    profit: 100,       // 100% profit
    duration: 3600     // 3600 seconds (60 minutes)
  }
];

/**
 * Default AI Arbitrage Levels
 * 
 * AI-driven arbitrage trading levels with different capital requirements,
 * profit percentages, and cycle durations.
 * 
 * @type {Array<{level: number, minCapital: number, maxCapital: number, profit: number, cycleDays: number}>}
 */
export const DEFAULT_ARBITRAGE_LEVELS = [
  { 
    level: 1, 
    minCapital: 1000, 
    maxCapital: 30000, 
    profit: 0.9,       // 0.9% profit
    cycleDays: 2       // 2-day cycle
  },
  { 
    level: 2, 
    minCapital: 30001, 
    maxCapital: 50000, 
    profit: 2,         // 2% profit
    cycleDays: 5       // 5-day cycle
  },
  { 
    level: 3, 
    minCapital: 50001, 
    maxCapital: 300000, 
    profit: 3.5,       // 3.5% profit
    cycleDays: 7       // 7-day cycle
  },
  { 
    level: 4, 
    minCapital: 300001, 
    maxCapital: 500000, 
    profit: 15,        // 15% profit
    cycleDays: 15      // 15-day cycle
  },
  { 
    level: 5, 
    minCapital: 500001, 
    maxCapital: 999999999, 
    profit: 20,        // 20% profit
    cycleDays: 30      // 30-day cycle
  }
];

/**
 * Default Deposit Addresses Configuration
 * 
 * Network configurations for accepting crypto deposits.
 * Addresses should be set through the admin panel.
 * 
 * @type {Array<{network: string, name: string, address: string, enabled: boolean}>}
 */
export const DEFAULT_DEPOSIT_ADDRESSES = [
  { network: 'BTC', name: 'Bitcoin', address: '', enabled: true },
  { network: 'ETH', name: 'Ethereum (ERC-20)', address: '', enabled: true },
  { network: 'BSC', name: 'BNB Smart Chain (BEP-20)', address: '', enabled: true },
  { network: 'TRC20', name: 'Tron (TRC-20)', address: '', enabled: true },
  { network: 'SOL', name: 'Solana', address: '', enabled: true },
  { network: 'MATIC', name: 'Polygon', address: '', enabled: true }
];

/**
 * Gets the trading level configuration for a specific level number
 * @param {number} level - The level number (1-5)
 * @returns {object|null} The trading level configuration or null if not found
 */
export function getTradingLevel(level) {
  return DEFAULT_TRADING_LEVELS.find(l => l.level === level) || null;
}

/**
 * Gets the arbitrage level configuration for a specific level number
 * @param {number} level - The level number (1-5)
 * @returns {object|null} The arbitrage level configuration or null if not found
 */
export function getArbitrageLevel(level) {
  return DEFAULT_ARBITRAGE_LEVELS.find(l => l.level === level) || null;
}

/**
 * Validates if a capital amount is within the allowed range for a trading level
 * @param {number} capital - The capital amount
 * @param {number} level - The trading level
 * @returns {boolean} True if the capital is valid for the level
 */
export function isValidCapitalForLevel(capital, level) {
  const levelConfig = getTradingLevel(level);
  if (!levelConfig) return false;
  
  return capital >= levelConfig.minCapital && capital <= levelConfig.maxCapital;
}
