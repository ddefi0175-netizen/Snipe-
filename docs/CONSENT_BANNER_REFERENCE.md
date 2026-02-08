# Consent Banner Visual Reference

This document provides a visual description of the implemented consent banner.

## Banner Appearance

### Position and Layout
- **Location**: Fixed at the bottom of the viewport
- **Width**: Full width (responsive)
- **Background**: Dark gradient (matches app theme)
- **Border**: Purple accent border on top
- **Z-index**: 9999 (appears above all content)

### Design Elements

#### Header
- 🍪 Cookie emoji + "We value your privacy"
- Purple accent color matching brand

#### Description
- Clear explanation of cookie usage
- Mentions analytics and personalization
- Easy-to-read font size

#### Action Buttons (Left to Right)
1. **Reject Optional** - Secondary style (outlined)
2. **Customize** - Link style (underlined)
3. **Accept All** - Primary style (purple gradient)

#### Footer
- Small text linking to Privacy Policy
- Muted color

### Expanded "Customize" View
Shows three cookie categories:
1. **Essential Cookies (Always Active)**
   - Security, authentication, basic functionality
   
2. **Analytics Cookies**
   - Google Analytics, anonymous data collection
   
3. **Advertising Cookies**
   - Personalized ads, ad effectiveness measurement

### Color Scheme
- **Background**: Dark blue gradient (#1a1a2e to #16213e)
- **Text**: White with varying opacity
- **Accent**: Purple (#7c3aed)
- **Border**: Purple with low opacity

### Animations
- Slides up from bottom with fade-in effect (0.3s)
- Smooth hover effects on buttons
- Expand/collapse animation for details

### Responsive Design
- Desktop: Horizontal button layout
- Mobile: Vertical stacked buttons, full width
- Tablet: Optimized spacing and font sizes

## User Flow

```
User visits site
    ↓
[No saved consent?]
    ↓ Yes
Display banner at bottom
    ↓
User makes choice:
├─ Accept All → Grant all consent → Hide banner → Track analytics
├─ Reject Optional → Deny optional consent → Hide banner → No tracking
└─ Customize → Show details → User makes informed choice
    ↓
Save to localStorage (valid 13 months)
    ↓
Banner won't show again until consent expires
```

## Technical Implementation

### Consent States
- **Default (on page load)**: All denied except essential
- **After Accept All**: All granted
- **After Reject Optional**: Only essential granted
- **Saved Preference**: Applied immediately from localStorage

### Integration Points
1. **index.html**: Consent mode initialization script
2. **main.jsx**: ConsentBanner component rendered
3. **consentMode.js**: Consent state management
4. **analytics.js**: GA4 initialization respecting consent
5. **localStorage**: Persistent consent preferences

## Accessibility
- Keyboard navigable
- Clear focus states
- High contrast text
- Descriptive button labels
- Screen reader friendly

## Compliance
✓ GDPR Article 7 - Clear consent request  
✓ GDPR Article 13 - Information provided  
✓ Google Consent Mode v2 - All parameters  
✓ Privacy by default - All denied initially  
✓ Consent expiry - 13 months maximum  
✓ Easy withdrawal - Clear reject option  

## Testing Checklist
- [ ] Banner appears on first visit
- [ ] Accept All grants consent and hides banner
- [ ] Reject Optional denies optional cookies
- [ ] Customize shows/hides details
- [ ] Consent persists across page reloads
- [ ] Consent expires after 13 months
- [ ] Privacy Policy link works
- [ ] Mobile responsive layout works
- [ ] Analytics only loads when accepted
- [ ] Console shows no errors
