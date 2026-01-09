# Logo Update Guide

This guide explains how to update the application logo.

## Current Logo Location

The application logo is located in the Header component as an inline SVG:

**File**: `Onchainweb/src/components/Header.jsx`

## How to Update the Logo

### Option 1: Replace with Image File

1. **Add your logo image** to `Onchainweb/public/` directory:
   ```bash
   # Place your logo file in public directory
   cp /path/to/your/logo.png Onchainweb/public/logo.png
   # Or logo.svg, logo.jpg, etc.
   ```

2. **Edit Header.jsx** to use the image:
   
   Find the brand div (around line 45):
   ```jsx
   {/* Brand - Crypto.com Style Logo */}
   <div className="brand" aria-label="OnchainWeb home">
     <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true">
       {/* ... SVG code ... */}
     </svg>
     <span className="brand-text">OnchainWeb</span>
   </div>
   ```

   Replace with:
   ```jsx
   {/* Brand Logo */}
   <div className="brand" aria-label="OnchainWeb home">
     <img 
       src="/logo.png" 
       alt="OnchainWeb Logo" 
       width="32" 
       height="32"
       style={{ objectFit: 'contain' }}
     />
     <span className="brand-text">OnchainWeb</span>
   </div>
   ```

### Option 2: Replace with New SVG

1. **Get your SVG code** from your logo file

2. **Edit Header.jsx** and replace the existing SVG:
   
   Find the brand SVG (around line 45) and replace the entire `<svg>` tag with your new SVG code.

   Example:
   ```jsx
   {/* Brand Logo */}
   <div className="brand" aria-label="OnchainWeb home">
     <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true">
       {/* Your custom SVG paths here */}
       <circle cx="50" cy="50" r="40" fill="#0052CC" />
       <text x="50" y="55" fontSize="30" textAnchor="middle" fill="white">S</text>
     </svg>
     <span className="brand-text">OnchainWeb</span>
   </div>
   ```

### Option 3: Update Favicon and Title

Update the site icon and title in `Onchainweb/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="/logo.png" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes" />
  <title>Your App Name - Real-Time Trading Platform</title>
  <!-- ... -->
</head>
```

## Logo Requirements

For best results, your logo should:

- **Size**: Minimum 32x32px, recommended 64x64px or higher
- **Format**: PNG, SVG, or JPG
- **Background**: Transparent (for PNG/SVG) or solid color matching your theme
- **Aspect Ratio**: Square (1:1) works best for the header
- **File Size**: Under 50KB for fast loading

## Where the Logo Appears

The logo is displayed in:

1. **Header Component** (`src/components/Header.jsx`)
   - Top navigation bar
   - Desktop and mobile views
   - Size: 32x32px

2. **Browser Tab** (favicon in `index.html`)
   - Add as `<link rel="icon" href="/your-logo.png" />`

3. **Admin Login Pages**
   - Master Admin Dashboard uses emoji icons (🔐, 🌐)
   - Can be updated in respective component files

## Testing Your New Logo

After updating the logo:

1. **Clear browser cache** or use incognito mode
2. **Rebuild the application**:
   ```bash
   cd Onchainweb
   npm run build
   ```
3. **Preview locally**:
   ```bash
   npm run dev
   ```
4. **Check all pages**:
   - Home page
   - Admin login pages
   - Mobile view

## Updating Logo from Telegram/Discord

If you have a logo from Telegram or Discord:

1. **Download the image** from Telegram/Discord to your computer
2. **Save it** to the `Onchainweb/public/` directory
3. **Follow Option 1 above** to use the image file

**Note**: Blob URLs (like `blob:https://web.telegram.org/...`) are temporary and only work in your browser session. You must download the actual file first.

## Need Help?

If you encounter issues:

1. Verify the image file exists in `public/` directory
2. Check file name and path are correct
3. Ensure image format is supported (PNG, SVG, JPG, WEBP)
4. Check browser console for errors
5. Try clearing browser cache and rebuilding

## Example: Complete Logo Update

Here's a complete example of updating to a PNG logo:

```bash
# 1. Copy your logo to public directory
cp ~/Downloads/my-logo.png Onchainweb/public/logo.png

# 2. Edit Header.jsx
# Replace the SVG with:
# <img src="/logo.png" alt="App Logo" width="32" height="32" />

# 3. Update index.html favicon
# Add: <link rel="icon" href="/logo.png" />

# 4. Rebuild
cd Onchainweb
npm run build

# 5. Test locally
npm run dev
```

---

**Last Updated**: January 2026  
**Need the actual logo file?** Please provide the logo as a downloadable file (PNG, SVG, or JPG) rather than a blob URL.
