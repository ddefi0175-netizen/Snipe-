#!/bin/bash

# Master Account Login Verification Script
# This script helps verify the master account configuration and login

set -e

echo "=========================================="
echo "   Master Account Login Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a value is set
check_env_var() {
    local var_name=$1
    local var_value=$2
    
    if [ -z "$var_value" ] || [ "$var_value" == "your-"* ]; then
        echo -e "${RED}✗${NC} $var_name - NOT CONFIGURED"
        return 1
    else
        echo -e "${GREEN}✓${NC} $var_name - Configured"
        return 0
    fi
}

echo "📋 Step 1: Checking Environment Configuration"
echo "----------------------------------------------"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created"
fi

# Source the .env file
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs 2>/dev/null || true)
fi

echo ""

# Check critical environment variables
echo "🔍 Checking Required Variables:"
echo ""

has_errors=0

# Firebase Configuration
check_env_var "VITE_FIREBASE_API_KEY" "$VITE_FIREBASE_API_KEY" || has_errors=1
check_env_var "VITE_FIREBASE_AUTH_DOMAIN" "$VITE_FIREBASE_AUTH_DOMAIN" || has_errors=1
check_env_var "VITE_FIREBASE_PROJECT_ID" "$VITE_FIREBASE_PROJECT_ID" || has_errors=1

echo ""

# Admin Configuration
check_env_var "VITE_ENABLE_ADMIN" "$VITE_ENABLE_ADMIN" || has_errors=1
check_env_var "VITE_ADMIN_ALLOWLIST" "$VITE_ADMIN_ALLOWLIST" || has_errors=1

echo ""

# Check if admin is enabled
if [ "$VITE_ENABLE_ADMIN" != "true" ]; then
    echo -e "${RED}✗ Admin features are disabled${NC}"
    echo "  Set VITE_ENABLE_ADMIN=true in .env file"
    has_errors=1
else
    echo -e "${GREEN}✓ Admin features are enabled${NC}"
fi

echo ""

# Extract master email from allowlist
if [ -n "$VITE_ADMIN_ALLOWLIST" ]; then
    MASTER_EMAIL=$(echo "$VITE_ADMIN_ALLOWLIST" | cut -d',' -f1 | tr -d ' ')
    
    if [[ $MASTER_EMAIL == master@* ]]; then
        echo -e "${GREEN}✓${NC} Master account email configured: ${GREEN}$MASTER_EMAIL${NC}"
    else
        echo -e "${YELLOW}⚠${NC} First email in allowlist doesn't start with 'master@'"
        echo "  Recommended format: master@yourdomain.com"
        echo "  Current: $MASTER_EMAIL"
    fi
else
    echo -e "${RED}✗ No emails in VITE_ADMIN_ALLOWLIST${NC}"
    has_errors=1
fi

echo ""
echo "=========================================="
echo ""

if [ $has_errors -eq 0 ]; then
    echo -e "${GREEN}✓ Configuration looks good!${NC}"
    echo ""
    echo "📍 Master Account Details:"
    echo "   Email:  $MASTER_EMAIL"
    echo "   Domain: $VITE_FIREBASE_AUTH_DOMAIN"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Master Dashboard: ${VITE_APP_URL:-http://localhost:5173}/master-admin"
    echo "   Admin Dashboard:  ${VITE_APP_URL:-http://localhost:5173}/admin"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Make sure master account is created in Firebase Console"
    echo "   2. Navigate to the master dashboard URL"
    echo "   3. Login with email: $MASTER_EMAIL"
    echo "   4. Enter the password you set during account creation"
    echo ""
    echo "🔍 To verify Firebase configuration:"
    echo "   - Go to Firebase Console → Authentication"
    echo "   - Check if user with email $MASTER_EMAIL exists"
    echo "   - Go to Firestore Database → admins collection"
    echo "   - Verify document exists with role: 'master'"
    echo ""
else
    echo -e "${RED}✗ Configuration issues found!${NC}"
    echo ""
    echo "📝 Action Required:"
    echo "   1. Edit the .env file in the repository root"
    echo "   2. Configure missing variables (see above)"
    echo "   3. Run this script again to verify"
    echo ""
    echo "💡 Hint: Copy values from Firebase Console:"
    echo "   Project Settings → General → Your apps → SDK setup"
    echo ""
    exit 1
fi

echo "=========================================="
echo ""
echo "✅ Verification Complete!"
echo ""
