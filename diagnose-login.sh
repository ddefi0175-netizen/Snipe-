#!/bin/bash

# Master Account Login Diagnostic Tool
# This script helps diagnose login issues by checking all components

set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║        Master Account Login Diagnostic Tool                         ║"
echo "║        Checking all components for login functionality              ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS_FOUND=0
WARNINGS_FOUND=0

# Function to check if a value is set
check_value() {
    local name=$1
    local value=$2
    local required=$3
    
    if [ -z "$value" ] || [ "$value" == "your-"* ]; then
        if [ "$required" == "true" ]; then
            echo -e "${RED}✗${NC} $name - MISSING (REQUIRED)"
            ERRORS_FOUND=$((ERRORS_FOUND + 1))
            return 1
        else
            echo -e "${YELLOW}⚠${NC} $name - Not set (optional)"
            WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
            return 2
        fi
    else
        echo -e "${GREEN}✓${NC} $name - Configured"
        return 0
    fi
}

echo "📋 Step 1: Checking Environment Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for .env files
echo "🔍 Checking .env file locations:"
if [ -f "Onchainweb/.env" ]; then
    echo -e "${GREEN}✓${NC} Onchainweb/.env exists (CORRECT location for Vite)"
    ENV_FILE="Onchainweb/.env"
elif [ -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} Root .env exists (should be in Onchainweb/ for Vite)"
    echo "  → Moving to Onchainweb/.env for proper Vite loading..."
    cp .env Onchainweb/.env 2>/dev/null || true
    ENV_FILE="Onchainweb/.env"
else
    echo -e "${RED}✗${NC} No .env file found"
    echo "  Creating from template..."
    if [ -f "Onchainweb/.env.example" ]; then
        cp Onchainweb/.env.example Onchainweb/.env
        ENV_FILE="Onchainweb/.env"
        echo -e "${GREEN}✓${NC} Created Onchainweb/.env from template"
    elif [ -f ".env.example" ]; then
        cp .env.example Onchainweb/.env
        ENV_FILE="Onchainweb/.env"
        echo -e "${GREEN}✓${NC} Created Onchainweb/.env from root template"
    else
        echo -e "${RED}✗${NC} No .env.example found to create from"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
        ENV_FILE=""
    fi
fi

echo ""

# Load environment variables
if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
    echo "📥 Loading environment variables from: $ENV_FILE"
    export $(grep -v '^#' "$ENV_FILE" | xargs 2>/dev/null || true)
    echo ""
fi

# Check critical environment variables
echo "🔐 Firebase Configuration (Required):"
check_value "VITE_FIREBASE_API_KEY" "$VITE_FIREBASE_API_KEY" "true"
check_value "VITE_FIREBASE_AUTH_DOMAIN" "$VITE_FIREBASE_AUTH_DOMAIN" "true"
check_value "VITE_FIREBASE_PROJECT_ID" "$VITE_FIREBASE_PROJECT_ID" "true"
check_value "VITE_FIREBASE_STORAGE_BUCKET" "$VITE_FIREBASE_STORAGE_BUCKET" "true"
check_value "VITE_FIREBASE_MESSAGING_SENDER_ID" "$VITE_FIREBASE_MESSAGING_SENDER_ID" "true"
check_value "VITE_FIREBASE_APP_ID" "$VITE_FIREBASE_APP_ID" "true"

echo ""
echo "👤 Admin Configuration (Required):"
check_value "VITE_ENABLE_ADMIN" "$VITE_ENABLE_ADMIN" "true"
check_value "VITE_ADMIN_ALLOWLIST" "$VITE_ADMIN_ALLOWLIST" "true"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check admin enabled
if [ "$VITE_ENABLE_ADMIN" != "true" ]; then
    echo -e "${RED}✗ Admin features are DISABLED${NC}"
    echo "  Set VITE_ENABLE_ADMIN=true in $ENV_FILE"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    echo -e "${GREEN}✓ Admin features are ENABLED${NC}"
fi

echo ""

# Extract and validate master email
if [ -n "$VITE_ADMIN_ALLOWLIST" ]; then
    MASTER_EMAIL=$(echo "$VITE_ADMIN_ALLOWLIST" | cut -d',' -f1 | tr -d ' ')
    
    echo "📧 Master Account Email Analysis:"
    echo "   Full allowlist: $VITE_ADMIN_ALLOWLIST"
    echo "   First email: $MASTER_EMAIL"
    echo ""
    
    # Check if email is valid format
    if [[ $MASTER_EMAIL =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${GREEN}✓${NC} Email format is valid"
    else
        echo -e "${RED}✗${NC} Email format is INVALID"
        echo "   Expected format: user@domain.com"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
    
    # Check if master prefix
    if [[ $MASTER_EMAIL == master@* ]]; then
        echo -e "${GREEN}✓${NC} Email starts with 'master@' (recommended)"
    else
        echo -e "${YELLOW}⚠${NC} Email doesn't start with 'master@'"
        echo "   Recommended format: master@yourdomain.com"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi
    
    # Check for fake domains
    if [[ $MASTER_EMAIL == *"@admin.onchainweb.app"* ]] || [[ $MASTER_EMAIL == *"@admin.local"* ]]; then
        echo -e "${RED}✗${NC} Using FAKE domain that Firebase will REJECT"
        echo "   Firebase requires real email domains"
        echo "   Use: master@onchainweb.site or master@gmail.com"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    else
        echo -e "${GREEN}✓${NC} Email uses valid domain (not fake)"
    fi
else
    echo -e "${RED}✗ No emails in VITE_ADMIN_ALLOWLIST${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
    MASTER_EMAIL=""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 Step 2: Checking Code for Common Issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for isFirebaseAvailable() function calls (should be boolean)
echo "🔍 Checking for isFirebaseAvailable() issues:"
if grep -r "isFirebaseAvailable()" Onchainweb/src --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v "typeof.*function" > /dev/null; then
    echo -e "${RED}✗${NC} Found isFirebaseAvailable() function calls (should be boolean check)"
    echo "   This is a known bug that prevents login"
    grep -rn "isFirebaseAvailable()" Onchainweb/src --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v "typeof.*function" | head -5
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
else
    echo -e "${GREEN}✓${NC} No incorrect isFirebaseAvailable() calls found"
fi

echo ""

# Check if key files exist
echo "📂 Checking key authentication files:"
FILES=(
    "Onchainweb/src/lib/firebase.js"
    "Onchainweb/src/lib/adminAuth.js"
    "Onchainweb/src/services/adminService.js"
    "Onchainweb/src/components/AdminLogin.jsx"
    "Onchainweb/src/components/AdminRouteGuard.jsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file MISSING"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Step 3: Summary and Recommendations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "📍 Master Account Details:"
    echo "   Email:  ${BLUE}$MASTER_EMAIL${NC}"
    echo "   Domain: ${BLUE}$VITE_FIREBASE_AUTH_DOMAIN${NC}"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Master Dashboard: ${BLUE}${VITE_APP_URL:-http://localhost:5173}/master-admin${NC}"
    echo "   Admin Dashboard:  ${BLUE}${VITE_APP_URL:-http://localhost:5173}/admin${NC}"
    echo ""
    echo "🔑 Login Steps:"
    echo "   1. Navigate to the Master Dashboard URL"
    echo "   2. Enter email: $MASTER_EMAIL"
    echo "   3. Enter your password (set during account creation)"
    echo "   4. Click 'Sign In'"
    echo ""
    echo "🔍 Verify in Firebase Console:"
    echo "   - Authentication → Users → $MASTER_EMAIL exists and enabled"
    echo "   - Firestore → admins collection → document with email=$MASTER_EMAIL"
    echo "   - Document has: role='master', permissions=['all']"
    echo ""
else
    echo -e "${RED}❌ Found $ERRORS_FOUND error(s)${NC}"
    if [ $WARNINGS_FOUND -gt 0 ]; then
        echo -e "${YELLOW}⚠  Found $WARNINGS_FOUND warning(s)${NC}"
    fi
    echo ""
    echo "📝 Action Required:"
    echo "   1. Review the errors above"
    echo "   2. Update your .env file: $ENV_FILE"
    echo "   3. Fix missing Firebase configuration"
    echo "   4. Run this script again to verify"
    echo ""
    echo "💡 Common Fixes:"
    echo "   - Get Firebase config from Firebase Console"
    echo "   - Set VITE_ENABLE_ADMIN=true"
    echo "   - Add valid email to VITE_ADMIN_ALLOWLIST"
    echo "   - Use real email domain (not fake)"
    echo "   - Fix isFirebaseAvailable() function calls"
    echo ""
fi

if [ $WARNINGS_FOUND -gt 0 ] && [ $ERRORS_FOUND -eq 0 ]; then
    echo -e "${YELLOW}⚠  Found $WARNINGS_FOUND warning(s) - review recommended${NC}"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS_FOUND -eq 0 ]; then
    echo "✅ Diagnostic Complete - Ready for login!"
    exit 0
else
    echo "❌ Diagnostic Complete - Issues found, please fix and re-run"
    exit 1
fi
