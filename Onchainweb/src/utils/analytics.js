/**
 * Google Analytics Integration
 * Initializes GA4 with consent mode support
 */

let analyticsInitialized = false;

/**
 * Load Google Analytics gtag.js script
 * @param {string} measurementId - GA4 Measurement ID
 */
const loadGtagScript = (measurementId) => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * Initialize Google Analytics
 * @param {string} measurementId - GA4 Measurement ID (G-XXXXXXXXXX)
 */
export const initializeAnalytics = async (measurementId) => {
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    console.warn('Google Analytics: Measurement ID not configured');
    return;
  }

  if (analyticsInitialized) {
    console.log('Google Analytics: Already initialized');
    return;
  }

  try {
    // Load gtag.js script
    await loadGtagScript(measurementId);

    // Ensure gtag function is available
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
    }

    // Configure Google Analytics
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    analyticsInitialized = true;
    console.log('Google Analytics: Initialized successfully');
  } catch (error) {
    console.error('Google Analytics: Failed to initialize', error);
  }
};

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} eventParams - Event parameters
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (!window.gtag) {
    console.warn('Google Analytics: gtag not available');
    return;
  }

  window.gtag('event', eventName, eventParams);
};

/**
 * Track page view
 * @param {string} pageTitle - Page title
 * @param {string} pagePath - Page path
 */
export const trackPageView = (pageTitle, pagePath) => {
  if (!window.gtag) {
    console.warn('Google Analytics: gtag not available');
    return;
  }

  window.gtag('event', 'page_view', {
    page_title: pageTitle,
    page_path: pagePath,
  });
};

/**
 * Track user action
 * @param {string} category - Event category
 * @param {string} action - Event action
 * @param {string} label - Event label (optional)
 */
export const trackUserAction = (category, action, label = '') => {
  trackEvent('user_action', {
    event_category: category,
    event_action: action,
    event_label: label,
  });
};

export default {
  initializeAnalytics,
  trackEvent,
  trackPageView,
  trackUserAction,
};
