import { useState, useEffect } from 'react';
import { acceptAllConsent, denyAllConsent, hasConsentChoice } from '../utils/consentMode';
import '../styles/consent-banner.css';

/**
 * ConsentBanner Component
 * Displays GDPR-compliant cookie consent banner
 * Implements Google Consent Mode v2
 */
const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a consent choice
    const hasChoice = hasConsentChoice();
    setShowBanner(!hasChoice);
  }, []);

  const handleAcceptAll = () => {
    acceptAllConsent();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    denyAllConsent();
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="consent-banner-overlay">
      <div className="consent-banner">
        <div className="consent-banner-content">
          <h3 className="consent-banner-title">🍪 We value your privacy</h3>
          
          <p className="consent-banner-description">
            We use cookies and similar technologies to improve your experience, 
            analyze site traffic, and personalize content. You can choose to accept 
            all cookies or customize your preferences.
          </p>

          {showDetails && (
            <div className="consent-details">
              <div className="consent-category">
                <h4>Essential Cookies (Always Active)</h4>
                <p>
                  Required for the website to function properly. These include security, 
                  authentication, and basic functionality.
                </p>
              </div>
              
              <div className="consent-category">
                <h4>Analytics Cookies</h4>
                <p>
                  Help us understand how visitors interact with our website by collecting 
                  anonymous information. This includes Google Analytics.
                </p>
              </div>
              
              <div className="consent-category">
                <h4>Advertising Cookies</h4>
                <p>
                  Used to deliver personalized advertisements and measure their effectiveness.
                </p>
              </div>
            </div>
          )}

          <div className="consent-banner-actions">
            <button 
              className="consent-btn consent-btn-secondary"
              onClick={handleRejectAll}
            >
              Reject Optional
            </button>
            
            <button 
              className="consent-btn consent-btn-link"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Customize'}
            </button>
            
            <button 
              className="consent-btn consent-btn-primary"
              onClick={handleAcceptAll}
            >
              Accept All
            </button>
          </div>

          <p className="consent-banner-footer">
            By clicking "Accept All", you consent to our use of cookies. 
            Learn more in our{' '}
            <a href="/privacy" className="consent-link">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
