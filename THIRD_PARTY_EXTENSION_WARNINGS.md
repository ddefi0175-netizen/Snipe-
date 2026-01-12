# Third-Party Browser Extension Warnings

## Overview

You may see deprecation warnings in the browser console that look like this:

```
injected.js:1 Deprecation warning: tabReply will be removed
content.js:1 Deprecation warning: tabReply will be removed
```

These warnings come from browser wallet extensions (like OKX Wallet, Trust Wallet, etc.) that inject code into web pages, **not from our application code**.

## What are `injected.js` and `content.js`?

These are script files injected by browser wallet extensions to provide Web3 functionality. The files are not part of our codebase and we have no control over their contents. Different wallet extensions may use different file names (`injected.js`, `content.js`, etc.) but they all serve the same purpose.

## What is `tabReply`?

`tabReply` is a browser extension API that some wallet extensions use to communicate between different parts of the extension. Browser vendors (Chrome, Firefox, etc.) have deprecated this API in favor of newer alternatives.

## Why Can't We Fix This?

1. **Not Our Code**: The warning comes from third-party browser extensions, not our application
2. **No Control**: We cannot modify code that wallet extensions inject into the page
3. **Extension Issue**: The wallet extension developers need to update their code to use modern APIs
4. **Temporary Warning**: This is a deprecation warning, not an error - functionality still works

## What We've Done

To reduce console noise and avoid confusion, we've implemented a console filter in our application that suppresses these known third-party warnings:

- **Production**: Warnings are automatically filtered
- **Development**: Warnings are filtered by default, but can be shown with `VITE_DEBUG_CONSOLE=true`

See `/src/lib/consoleFilter.js` for implementation details.

## For Developers

If you want to see ALL console messages including filtered third-party warnings, add this to your `.env`:

```bash
VITE_DEBUG_CONSOLE=true
```

This will prefix filtered warnings with `[FILTERED - Third-party]` so you can see what's being suppressed.

## Affected Wallet Extensions

The following wallet extensions are known to generate these warnings:

- OKX Wallet
- Trust Wallet  
- Some versions of MetaMask
- TokenPocket
- Binance Web3 Wallet

## For Users

**This warning does not affect functionality.** Your wallet connections and all app features work normally. The warning is purely informational and will eventually disappear when wallet extensions update their code.

## For Extension Developers

If you maintain a wallet extension and see this warning:

1. Update from deprecated `chrome.runtime.tabReply` to `chrome.runtime.sendMessage`
2. Review Chrome Extension Migration Guide: https://developer.chrome.com/docs/extensions/migrating/
3. Test with latest Chrome/Firefox versions

## Related Documentation

- [Chrome Extensions - Deprecated APIs](https://developer.chrome.com/docs/extensions/reference/)
- [Firefox WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Web3 Provider Injection Best Practices](https://eips.ethereum.org/EIPS/eip-1193)

## Summary

✅ **Safe to Ignore**: This warning doesn't affect functionality  
✅ **Not Our Bug**: Issue is in third-party wallet extensions  
✅ **Being Handled**: We filter these warnings to reduce noise  
✅ **Temporary**: Will resolve when extensions update

---

**Last Updated**: January 2026  
**Status**: Documented, Filtered, Monitoring
