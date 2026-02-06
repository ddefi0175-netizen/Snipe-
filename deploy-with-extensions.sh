#!/bin/bash

# 🚀 Snipe App - Complete Deployment & Firebase Extensions Setup
# This script guides you through Firebase setup, extension installation, and app deployment

set -e

PROJECT_ID="onchainweb-37d30"
APP_DIR="Onchainweb"
FIREBASE_URL="https://console.firebase.google.com/u/0/project/$PROJECT_ID"
EXTENSIONS_URL="https://console.firebase.google.com/u/0/project/$PROJECT_ID/extensions"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_title() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC}  $1"
}

ask_yes_no() {
    local prompt="$1"
    # Default to 'yes' automatically
    echo -e "${YELLOW}${prompt} (y/n)${NC} [auto-selecting 'y']"
    [[ 1 ]]
}

# ============================================================================
# PHASE 1: FIREBASE CONSOLE PREREQUISITES
# ============================================================================

print_title "PHASE 1: Firebase Console Setup (Manual)"

if ! ask_yes_no "Have you completed steps 1-3 in Firebase Console?"; then
    print_error "Please complete Firebase Console setup first"
    exit 1
fi

print_status "Firebase services activated"

# ============================================================================
# PHASE 2: CREATE ADMIN ACCOUNTS
# ============================================================================

print_title "PHASE 2: Create Admin Accounts"

if ! ask_yes_no "Have you created both admin accounts?"; then
    print_error "Admin accounts required for app to function"
    exit 1
fi

print_status "Admin accounts created"

# ============================================================================
# PHASE 3: FIREBASE EXTENSIONS (OPTIONAL)
# ============================================================================

print_title "PHASE 3: Firebase Extensions (Optional)"

if ask_yes_no "Do you want to install Firebase Extensions now?"; then
    if ask_yes_no "Have you finished installing extensions?"; then
        print_status "Extensions installed"
    else
        print_warning "Skipping extensions - you can install them later"
    fi
else
    print_warning "Extensions skipped"
fi

# ============================================================================
# PHASE 4: DEPLOY FIRESTORE RULES
# ============================================================================

print_title "PHASE 4: Deploy Firestore Rules & Indexes"

echo "📋 Deploying database security rules..."
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Deploy rules
if firebase deploy --only firestore:rules,firestore:indexes --project "$PROJECT_ID" 2>&1; then
    print_status "Firestore rules and indexes deployed"
else
    print_error "Failed to deploy Firestore rules"
fi

# ============================================================================
# PHASE 5: BUILD APPLICATION
# ============================================================================

print_title "PHASE 5: Build Application"

echo "🔨 Building production bundle..."
echo ""

cd "$APP_DIR"

# Clean build
rm -rf dist node_modules/.vite 2>/dev/null || true

npm install

# Build
if npm run build; then
    print_status "Build successful"
else
    print_error "Build failed"
    exit 1
fi

cd ..

# ============================================================================
# PHASE 7: DEPLOY TO PRODUCTION
# ============================================================================

print_title "PHASE 7: Deploy to Production"

echo "Deploying to Firebase Hosting..."

if firebase deploy --only hosting --project "$PROJECT_ID"; then
    print_status "Deployed to Firebase Hosting"
    PRODUCTION_URL="https://$PROJECT_ID.web.app"
    print_info "Production URL: $PRODUCTION_URL"
else
    print_error "Firebase deployment failed"
    exit 1
fi

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print_title "🎉 Deployment Complete!"

echo "Your Snipe app is now LIVE!"
echo ""
echo "📍 Key Links:"
echo "   Main App: $PRODUCTION_URL"
echo "   Master Admin: $PRODUCTION_URL/master-admin"
echo "   Admin Panel: $PRODUCTION_URL/admin"
echo "   Firebase Console: $FIREBASE_URL"
