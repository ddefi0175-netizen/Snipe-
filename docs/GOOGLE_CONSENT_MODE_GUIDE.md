# Google Consent Mode v2 Implementation Guide

## Overview

This project now implements **Google Consent Mode v2** to ensure GDPR compliance and proper handling of user consent for cookies and analytics. The implementation follows Google's best practices for sending consent signals and uses the consent mode override setting.

## What is Google Consent Mode v2?

Google Consent Mode v2 is a framework that allows websites to adjust how Google tags behave based on user consent choices. It includes four new consent parameters:

- `analytics_storage` - Controls analytics cookies
- `ad_storage` - Controls advertising cookies
- `ad_personalization` - Controls personalized advertising
- `ad_user_data` - Controls sending user data for advertising
- `functionality_storage` - Controls functionality cookies (essential)
- `security_storage` - Controls security cookies (essential)

## Implementation Details

### 1. Consent Initialization (index.html)

The consent mode is initialized in `index.html` **before** any other analytics scripts load. This ensures all tracking respects user consent from the start:

```html
<!-- Google Consent Mode v2 - Initialize before any analytics scripts -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_personalization': 'denied',
    'ad_user_data': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  });
</script>
```

### 2. Consent Management Utility

**Location:** `Onchainweb/src/utils/consentMode.js`

This utility provides functions to:
- Initialize consent mode
- Update consent when user makes a choice
- Accept/deny all consent
- Save consent preferences to localStorage
- Check consent expiry (13 months per GDPR)

**Key Functions:**
- `initializeConsentMode()` - Sets up gtag with default denied state
- `acceptAllConsent()` - Grants all consents when user accepts
- `denyAllConsent()` - Denies optional consents when user rejects
- `updateConsent(state)` - Updates specific consent categories
- `hasConsentChoice()` - Checks if user has made a choice

### 3. Consent Banner Component

**Location:** `Onchainweb/src/components/ConsentBanner.jsx`

A GDPR-compliant consent banner that:
- Appears on first visit
- Shows consent options clearly
- Allows accepting all, rejecting optional, or customizing
- Links to privacy policy
- Remembers user choice for 13 months

**Styling:** `Onchainweb/src/styles/consent-banner.css`

### 4. Analytics Integration

**Location:** `Onchainweb/src/utils/analytics.js`

Handles Google Analytics initialization with consent mode support:
- Loads gtag.js script dynamically
- Configures GA4 with Firebase Measurement ID
- Provides event tracking functions
- Respects consent state

### 5. Main App Integration

**Location:** `Onchainweb/src/main.jsx`

The consent banner is rendered in the main app wrapper:
```jsx
<ConsentBanner />
```

Analytics is initialized when `VITE_ENABLE_ANALYTICS=true` and measurement ID is configured.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable analytics tracking
VITE_ENABLE_ANALYTICS=true

# Firebase Analytics Measurement ID (format: G-XXXXXXXXXX)
# Get from Firebase Console > Project Settings > General > Your apps > Web app
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Content Security Policy

The CSP in `index.html` has been updated to allow Google Analytics:

```
script-src ... https://www.googletagmanager.com https://www.google-analytics.com
connect-src ... https://www.google-analytics.com https://analytics.google.com
```

## How It Works

### Initial Page Load

1. **Default Consent Set**: Before any scripts load, consent is set to "denied" for all optional categories
2. **Check Saved Preferences**: If user previously made a choice, it's applied immediately from localStorage
3. **Show Banner**: If no saved preference exists, consent banner appears

### User Interaction

1. **User Clicks "Accept All"**:
   - All consent categories set to "granted"
   - Preference saved to localStorage
   - Banner disappears
   - Analytics starts collecting data

2. **User Clicks "Reject Optional"**:
   - Only essential cookies remain granted
   - Preference saved to localStorage
   - Banner disappears
   - No analytics data collected

3. **User Clicks "Customize"**:
   - Shows detailed information about each cookie category
   - User can make informed decision

### Consent Signals

Consent signals are automatically sent by gtag with every event and pageview:
- `gcs` parameter includes current consent state
- Google uses these signals for modeling and attribution
- No manual signal transmission needed

### Consent Persistence

- User choices saved to localStorage
- Valid for 13 months per GDPR requirements
- After 13 months, banner shows again

## Testing & Validation

### Browser Developer Tools

1. **Check Console**:
   - Look for consent initialization messages
   - Verify no errors

2. **Check Network Tab**:
   - Look for requests to `google-analytics.com`
   - Check for `gcs` parameter in request URLs
   - Should only appear after consent granted

3. **Check Application Tab**:
   - LocalStorage should have `user_consent_preferences` key
   - Check timestamp and consent state

### Google Tag Assistant

1. Install [Tag Assistant](https://tagassistant.google.com/)
2. Visit your site
3. Check consent status in Tag Assistant panel
4. Verify tags only fire when consent granted

### Testing Workflow

```bash
# 1. Build the project
cd Onchainweb
npm run build

# 2. Serve the build locally
npx serve dist

# 3. Open browser to http://localhost:3000
# 4. Open DevTools and check:
#    - Console for initialization
#    - Network for GA requests
#    - Application for localStorage
#    - Accept consent and verify GA loads
```

## Compliance

This implementation ensures:

✅ **GDPR Compliance**
- Clear consent request before tracking
- Easy to accept or reject
- Persistent consent storage (13 months max)
- Privacy policy link

✅ **Google Requirements**
- Consent Mode v2 implemented
- All four new parameters configured
- Consent signals sent with every request
- Override pattern followed (default denied, update on user choice)

✅ **Best Practices**
- Consent set before analytics load
- No race conditions
- Graceful fallback if scripts fail
- User-friendly interface

## Troubleshooting

### Banner Doesn't Show
- Clear localStorage
- Hard refresh (Ctrl+Shift+R)
- Check console for errors

### Analytics Not Loading
1. Verify `VITE_ENABLE_ANALYTICS=true`
2. Check `VITE_FIREBASE_MEASUREMENT_ID` is set
3. Verify consent was accepted
4. Check Network tab for blocked requests

### Consent Not Persisting
- Check browser allows localStorage
- Verify no incognito mode
- Check for JavaScript errors

## Migration from Previous Implementation

If you had a manual consent banner:

1. Remove old consent code
2. This implementation uses consent mode override
3. User preferences are preserved
4. No backend changes needed

## Resources

- [Google Consent Mode v2 Documentation](https://developers.google.com/tag-platform/security/guides/consent)
- [Firebase Analytics Setup](https://firebase.google.com/docs/analytics/get-started?platform=web)
- [GDPR Compliance Guidelines](https://gdpr.eu/)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables are set
3. Test in incognito mode (fresh state)
4. Review implementation files in `src/utils/` and `src/components/`
