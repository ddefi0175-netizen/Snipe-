# Logo Setup Guide

## Current Status

✅ **Logo System Ready** - The app is now configured to display your custom logo with automatic fallbacks.

## How to Use Your Logo

### Option 1: Add Your Circular City Logo (Recommended)

1. **Save your logo image**:
   - Save your circular city logo as PNG format
   - Recommended size: 128×128px or larger
   - Transparent background works best

2. **Place in the correct location**:
   ```bash
   # Copy your logo.png to the public folder
   cp your-logo.png /workspaces/Snipe-/Onchainweb/public/logo.png
   ```

3. **Test locally**:
   ```bash
   cd Onchainweb
   npm run dev
   # Visit http://localhost:5173
   # Your logo should appear in the top-left corner
   ```

### Option 2: Use Alternative Location

If you prefer to store the logo in a different location:
```bash
# Place it in the images folder
cp your-logo.png /workspaces/Snipe-/Onchainweb/public/images/logo.png
```

The app will automatically fall back to this location if the primary path is not found.

## Logo Fallback Chain

The header displays your logo with automatic fallbacks in this order:

```
1. /logo.png (Primary - User's custom logo)
   ↓ (if fails)
2. /images/logo.png (Alternative location)
   ↓ (if fails)
3. /logo.svg (SVG placeholder with glow effect)
   ↓ (if fails)
4. "OnchainWeb" text (Text fallback)
```

## Current Placeholder

A professional SVG placeholder with glow effect is already in place at `/Onchainweb/public/logo.svg`. This ensures your app always displays a branded logo, even if you haven't added your custom image yet.

**Placeholder features**:
- Hexagon crypto-style shape
- Blue-to-cyan gradient
- Glow effect
- Geometric pattern inside
- 32×32px display size

## Logo Styling

The logo automatically includes:
- ✅ Cyan glow effect (adjusts on hover)
- ✅ Smooth transitions
- ✅ Brightness boost for visibility
- ✅ Rounded corners (4px)
- ✅ Proper sizing on all devices

## File Locations

```
Onchainweb/public/
├── logo.png          ← Primary: Put your logo here
├── logo.svg          ← Placeholder (already configured)
├── images/
│   └── logo.png      ← Alternative location
└── index.html
```

## Testing Your Logo

### Local Test:
```bash
cd Onchainweb
npm run dev
# Open browser and check top-left logo
```

### After Adding Your Logo:
- The header will automatically display your PNG
- Hover over it - it should glow brighter
- The glow effect is responsive to theme changes

## Deployment

When deploying to production:

1. **Vercel/Netlify**:
   ```bash
   npm run build
   # Your logo in public/ will be included automatically
   ```

2. **Custom Server**:
   - Ensure `/logo.png` is served from the public directory
   - Fallback SVG is embedded in the component

## Troubleshooting

**Logo not showing?**
- Check file is at `/Onchainweb/public/logo.png`
- Verify file name matches exactly (case-sensitive)
- Try clearing browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

**Logo looks blurry?**
- Use a higher resolution PNG (256×256 or larger)
- The display size is 32×32px, so quality matters

**Want to change styling?**
- Edit `.brand-logo` class in `Onchainweb/src/index.css`
- Current settings: glow effect, brightness boost, rounded corners

## Example: Adding Your Circular City Logo

```bash
# Assuming your logo is in Downloads
cp ~/Downloads/city-logo.png /workspaces/Snipe-/Onchainweb/public/logo.png

# Then restart your dev server
cd /workspaces/Snipe-/Onchainweb
npm run dev
```

That's it! Your logo will appear in the header with automatic fallbacks and styling.

---

**Status**: Ready to use with your custom logo
**Fallback**: SVG placeholder active until logo is added
**Theme**: Matches dark blue theme with cyan accents
