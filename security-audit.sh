#!/bin/bash
# Pre-deployment security audit

echo "🔒 Security Audit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

ISSUES=0

# Check 1: Firestore rules
echo "1. Checking Firestore security rules..."
if grep -q "allow write.*: if true" firestore.rules; then
    echo "   ❌ CRITICAL: Open write access detected!"
    ((ISSUES++))
else
    echo "   ✅ No open write access"
fi

# Check 2: Exposed secrets in code
echo "2. Checking for exposed secrets..."
if grep -r "AIza[0-9A-Za-z-_]\{35\}" Onchainweb/src --exclude-dir=node_modules | grep -v "import.meta.env"; then
    echo "   ⚠️  WARNING: Potential hardcoded API keys found"
    ((ISSUES++))
else
    echo "   ✅ No hardcoded secrets detected"
fi

# Check 3: Admin allowlist configured
echo "3. Checking admin allowlist..."
if grep -q "VITE_ADMIN_ALLOWLIST=" Onchainweb/.env && [ -n "$(grep VITE_ADMIN_ALLOWLIST= Onchainweb/.env | cut -d'=' -f2)" ]; then
    echo "   ✅ Admin allowlist configured"
else
    echo "   ⚠️  WARNING: Admin allowlist not configured"
    ((ISSUES++))
fi

# Check 4: HTTPS enforcement
echo "4. Checking HTTPS usage..."
if grep -q "https://" Onchainweb/.env; then
    echo "   ✅ HTTPS URLs detected"
else
    echo "   ⚠️  WARNING: No HTTPS URLs found"
fi

# Check 5: No .env in git
echo "5. Checking .gitignore..."
if grep -q "\.env" .gitignore; then
    echo "   ✅ .env is gitignored"
else
    echo "   ❌ CRITICAL: .env not in .gitignore!"
    ((ISSUES++))
fi

# Check 6: Production Firebase rules
echo "6. Validating production-ready rules..."
if grep -q "request.auth" firestore.rules; then
    echo "   ✅ Authentication checks present"
else
    echo "   ❌ CRITICAL: No authentication checks!"
    ((ISSUES++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Issues found: $ISSUES"

if [ $ISSUES -gt 0 ]; then
    echo "⚠️  Review security issues before deploying to production"
    exit 1
else
    echo "✅ Security audit passed"
fi
