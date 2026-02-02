#!/bin/bash

# Master Account Domain Access Verification Script
# This script helps verify that the master account domain is properly configured

echo "============================================"
echo "Master Account Domain Access Verification"
echo "============================================"
echo ""

# Change to the Onchainweb directory
cd "$(dirname "$0")/Onchainweb" || exit 1

echo "1. Checking if .env file exists..."
if [ -f ".env" ]; then
    echo "   ✅ .env file found"
else
    echo "   ❌ .env file NOT found"
    echo "   Please create .env file from .env.example"
    exit 1
fi

echo ""
echo "2. Checking VITE_ENABLE_ADMIN setting..."
ADMIN_ENABLED=$(grep "^VITE_ENABLE_ADMIN=" .env | cut -d'=' -f2 | tr -d ' ')
if [ "$ADMIN_ENABLED" = "true" ]; then
    echo "   ✅ Admin features are ENABLED"
else
    echo "   ❌ Admin features are DISABLED"
    echo "   Set VITE_ENABLE_ADMIN=true in .env file"
    exit 1
fi

echo ""
echo "3. Checking admin allowlist..."
ALLOWLIST=$(grep "^VITE_ADMIN_ALLOWLIST=" .env | cut -d'=' -f2 | tr -d ' ')
if [ -n "$ALLOWLIST" ]; then
    echo "   ✅ Admin allowlist is configured: $ALLOWLIST"
    
    # Check if there's a master account (starts with master@)
    if echo "$ALLOWLIST" | grep -q "master@"; then
        echo "   ✅ Master account found in allowlist"
    else
        echo "   ⚠️  WARNING: No email starting with 'master@' in allowlist"
        echo "   Master accounts must have email starting with 'master@'"
    fi
else
    echo "   ⚠️  WARNING: Admin allowlist is empty"
    echo "   Add master account email to VITE_ADMIN_ALLOWLIST in .env"
fi

echo ""
echo "4. Checking Firebase configuration..."
FIREBASE_API_KEY=$(grep "^VITE_FIREBASE_API_KEY=" .env | cut -d'=' -f2 | tr -d ' ')
FIREBASE_PROJECT_ID=$(grep "^VITE_FIREBASE_PROJECT_ID=" .env | cut -d'=' -f2 | tr -d ' ')

if [ -n "$FIREBASE_API_KEY" ] && [ -n "$FIREBASE_PROJECT_ID" ]; then
    echo "   ✅ Firebase credentials are configured"
else
    echo "   ⚠️  WARNING: Firebase credentials are NOT configured"
    echo "   Configure VITE_FIREBASE_* variables in .env file"
    echo "   Get credentials from: https://console.firebase.google.com"
fi

echo ""
echo "5. Checking WalletConnect configuration..."
WC_PROJECT_ID=$(grep "^VITE_WALLETCONNECT_PROJECT_ID=" .env | cut -d'=' -f2 | tr -d ' ')
if [ -n "$WC_PROJECT_ID" ]; then
    echo "   ✅ WalletConnect Project ID is configured"
else
    echo "   ⚠️  WARNING: WalletConnect Project ID is NOT configured"
    echo "   Get free Project ID from: https://cloud.walletconnect.com"
fi

echo ""
echo "============================================"
echo "Verification Summary"
echo "============================================"
echo ""

if [ "$ADMIN_ENABLED" = "true" ] && [ -n "$ALLOWLIST" ]; then
    echo "✅ Master account domain is ACCESSIBLE"
    echo ""
    echo "Next steps:"
    echo "1. Configure Firebase credentials in .env (if not done yet)"
    echo "2. Create master account in Firebase Console:"
    echo "   - Go to https://console.firebase.google.com"
    echo "   - Authentication > Users > Add user"
    echo "   - Email: master@onchainweb.site (or your custom email)"
    echo "   - Password: Strong password (12+ characters)"
    echo "3. Start dev server: npm run dev"
    echo "4. Access master admin: http://localhost:5173/master-admin"
    echo ""
    echo "For detailed setup instructions, see:"
    echo "- MASTER_ACCOUNT_SETUP_GUIDE.md"
    echo "- MASTER_ACCOUNT_DOMAIN_FIX_2026.md"
else
    echo "❌ Master account domain is NOT accessible"
    echo ""
    echo "Required fixes:"
    if [ "$ADMIN_ENABLED" != "true" ]; then
        echo "- Set VITE_ENABLE_ADMIN=true in .env"
    fi
    if [ -z "$ALLOWLIST" ]; then
        echo "- Add master email to VITE_ADMIN_ALLOWLIST in .env"
    fi
    echo ""
    echo "Run this script again after making changes."
fi

echo ""
