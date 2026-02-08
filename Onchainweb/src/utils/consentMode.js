/**
 * Google Consent Mode v2 Utility
 * Handles consent state management and gtag integration
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */

const CONSENT_STORAGE_KEY = 'user_consent_preferences';

// Default consent state (denied until user accepts)
export const DEFAULT_CONSENT = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_personalization: 'denied',
  ad_user_data: 'denied',
  functionality_storage: 'granted', // Required for basic site functionality
  security_storage: 'granted', // Required for security features
};

// Consent state when user accepts all
export const GRANTED_CONSENT = {
  ad_storage: 'granted',
  analytics_storage: 'granted',
  ad_personalization: 'granted',
  ad_user_data: 'granted',
  functionality_storage: 'granted',
  security_storage: 'granted',
};

/**
 * Initialize consent mode with default state
 * Should be called before any Google Analytics scripts load
 */
export const initializeConsentMode = () => {
  // Initialize dataLayer if not already present
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  // Set default consent state
  window.gtag('consent', 'default', DEFAULT_CONSENT);
  
  // Check if user has previously set consent preferences
  const savedConsent = getSavedConsent();
  if (savedConsent) {
    // Apply saved preferences immediately
    window.gtag('consent', 'update', savedConsent);
  }
};

/**
 * Update consent state when user makes a choice
 * @param {Object} consentState - Consent state object
 */
export const updateConsent = (consentState) => {
  if (!window.gtag) {
    console.error('gtag not initialized. Call initializeConsentMode first.');
    return;
  }
  
  // Update consent state
  window.gtag('consent', 'update', consentState);
  
  // Save to localStorage for persistence
  saveConsent(consentState);
};

/**
 * Grant all consent (user accepts all cookies)
 */
export const acceptAllConsent = () => {
  updateConsent(GRANTED_CONSENT);
};

/**
 * Deny all consent (user rejects all optional cookies)
 */
export const denyAllConsent = () => {
  updateConsent({
    ...DEFAULT_CONSENT,
    // Keep essential cookies granted
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
};

/**
 * Save consent preferences to localStorage
 * @param {Object} consentState - Consent state to save
 */
const saveConsent = (consentState) => {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      consent: consentState,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Failed to save consent preferences:', error);
  }
};

/**
 * Get saved consent preferences from localStorage
 * @returns {Object|null} Saved consent state or null
 */
export const getSavedConsent = () => {
  try {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // Check if consent is older than 13 months (GDPR requirement)
    // Using average month length: 13 * 30.44 days = 395.72 days
    const thirteenMonths = 13 * 30.44 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > thirteenMonths) {
      // Consent expired, clear it
      clearConsent();
      return null;
    }
    
    return parsed.consent;
  } catch (error) {
    console.error('Failed to get saved consent:', error);
    return null;
  }
};

/**
 * Clear saved consent preferences
 */
export const clearConsent = () => {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear consent:', error);
  }
};

/**
 * Check if user has made a consent choice
 * @returns {boolean} True if consent has been set
 */
export const hasConsentChoice = () => {
  return getSavedConsent() !== null;
};

/**
 * Initialize Google Analytics with consent mode
 * @param {string} measurementId - GA4 Measurement ID (G-XXXXXXXXXX)
 */
export const initializeGoogleAnalytics = (measurementId) => {
  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not provided');
    return;
  }
  
  if (!window.gtag) {
    console.error('gtag not initialized. Call initializeConsentMode first.');
    return;
  }
  
  // Configure Google Analytics
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    // Send page view automatically
    send_page_view: true,
    // Anonymize IP addresses
    anonymize_ip: true,
    // Cookie settings
    cookie_flags: 'SameSite=None;Secure',
  });
};
