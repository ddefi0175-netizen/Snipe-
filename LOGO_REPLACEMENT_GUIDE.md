# Logo Replacement Guide

## Quick Start

To replace the logo for your Snipe trading platform:

1. **Prepare Your Logo**
   - Recommended dimensions: **192x192 pixels** or larger (square format)
   - Supported formats: PNG (with transparency) or SVG
   - File size: Keep under 100KB for optimal performance
   - Make sure the logo looks good on both dark and light backgrounds

2. **Replace the Logo File**
   ```bash
   # Navigate to the public directory
   cd Onchainweb/public/
   
   # Backup the existing logo (optional)
   mv logo.png logo-backup.png
   
   # Copy your new logo
   cp /path/to/your/logo.png logo.png
   ```

3. **Verify the Logo**
   - Start the development server: `npm run dev`
   - Navigate to `http://localhost:5173`
   - Check the logo appears in the header (displayed at 48x48px)

## Logo Display Specifications

### Current Size
- Display size: **48x48 pixels** (updated from 32x32px)
- Border radius: 4px
- Visual effects: Drop shadow with cyan glow

### Logo Placement
- Located in: `Onchainweb/public/logo.png`
- Used in: Header component (`src/components/Header.jsx`)
- CSS styling: `src/index.css` (`.brand-logo` class)

## Advanced Customization

### Adjusting Logo Size

If you need a different logo size, edit the CSS:

```css
/* In: Onchainweb/src/index.css */
.brand-logo,
.brand-logo-fallback {
  width: 48px;    /* Change this */
  height: 48px;   /* Change this */
  /* ... other styles ... */
}
```

### Using SVG Logo

If you prefer to use an SVG logo:

1. Save your logo as `logo.svg` in `Onchainweb/public/`
2. Update `Header.jsx`:
   ```jsx
   <img
     src="/logo.svg"  /* Change from logo.png to logo.svg */
     alt="OnchainWeb Logo"
     className="brand-logo"
   />
   ```

### Customizing Logo Effects

The logo has a cyan glow effect. To customize:

```css
/* In: Onchainweb/src/index.css */
.brand-logo,
.brand-logo-fallback {
  /* Change the glow color and intensity */
  filter: drop-shadow(0 0 8px rgba(0, 194, 255, 0.6)) brightness(1.05);
}

.brand-logo:hover,
.brand-logo-fallback:hover {
  /* Change the hover effect */
  filter: drop-shadow(0 0 12px rgba(0, 194, 255, 0.8)) brightness(1.15);
}
```

## Troubleshooting

### Logo Not Showing

1. **Check file path**: Ensure logo is in `Onchainweb/public/logo.png`
2. **Check file name**: Must be exactly `logo.png` (case-sensitive)
3. **Clear browser cache**: Hard refresh with `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
4. **Check file format**: Ensure it's a valid PNG or SVG file

### Logo Looks Blurry

1. Use a higher resolution source image (at least 192x192px)
2. Ensure the image is sharp at the source (not already pixelated)
3. Use PNG format with transparency for best quality

### Logo Too Large/Small

Adjust the CSS width/height values as described in "Adjusting Logo Size" section above.

## Production Deployment

After replacing the logo locally:

1. **Test locally first**: `npm run build && npm run preview`
2. **Commit changes**:
   ```bash
   git add Onchainweb/public/logo.png
   git commit -m "Update platform logo"
   git push
   ```
3. **Deploy**: Follow your normal deployment process (Vercel/Firebase)

## Best Practices

1. **Keep it simple**: Logos should be recognizable at small sizes
2. **Test on dark backgrounds**: The default theme is dark
3. **Use transparency**: PNG with transparent background works best
4. **Optimize file size**: Use tools like TinyPNG to compress without quality loss
5. **Version control**: Keep a backup of your original logo file

## Support

For additional customization or issues:
- Check the [README.md](README.md) for general setup
- Review [CUSTOMIZATION_SUMMARY.md](CUSTOMIZATION_SUMMARY.md) for other customizations
- Open an issue on GitHub if you need help

---

**Note**: The logo will automatically scale to 48x48px on display regardless of source dimensions, so provide high-quality source files for best results.
