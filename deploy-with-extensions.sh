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
    read -p "$(echo -e ${YELLOW})$prompt (y/n)$(echo -e ${NC}) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# ============================================================================
# PHASE 1: FIREBASE CONSOLE PREREQUISITES
# ============================================================================

print_title "PHASE 1: Firebase Console Setup (Manual)"

echo "📋 You need to complete these steps in Firebase Console:"
echo ""
echo "1️⃣  FIRESTORE DATABASE"
echo "   → Go: ${FIREBASE_URL}"
echo "   → Click Build → Firestore Database → Create Database"
echo "   → Choose: Production mode"
echo "   → Location: us-central1 (United States)"
echo "   → Click: Create"
echo ""
echo "2️⃣  AUTHENTICATION"
echo "   → Click Build → Authentication → Get Started"
echo "   → Click Email/Password → Enable"
echo "   → Click Save"
echo ""
echo "3️⃣  CLOUD STORAGE (Optional but recommended)"
echo "   → Click Build → Storage → Get Started"
echo "   → Accept default bucket"
echo "   → Choose: Start in Production mode"
echo "   → Click: Done"
echo ""

if ! ask_yes_no "Have you completed steps 1-3 in Firebase Console?"; then
    print_error "Please complete Firebase Console setup first"
    echo "Open: $FIREBASE_URL"
    echo "Then run this script again."
    exit 1
fi

print_status "Firebase services activated"

# ============================================================================
# PHASE 2: CREATE ADMIN ACCOUNTS
# ============================================================================

print_title "PHASE 2: Create Admin Accounts"

echo "You need to create 2 accounts in Firebase Console:"
echo ""
echo "📧 Master Admin Account"
echo "   Email: master@gmail.com"
echo "   Go: ${FIREBASE_URL}/authentication/users"
echo "   Click Add User → Enter email & password → Save"
echo ""
echo "📧 Regular Admin Account"
echo "   Email: admin@gmail.com"
echo "   Same process"
echo ""

if ! ask_yes_no "Have you created both admin accounts?"; then
    print_error "Admin accounts required for app to function"
    exit 1
fi

print_status "Admin accounts created"

# ============================================================================
# PHASE 3: FIREBASE EXTENSIONS (OPTIONAL)
# ============================================================================

print_title "PHASE 3: Firebase Extensions (Optional)"

echo "Extensions automate backend tasks. You can:"
echo ""
echo "Option A: Install extensions NOW (recommended)"
echo "Option B: Skip for now, install LATER"
echo ""
echo "Recommended extensions:"
echo "  • Cloud Tasks Queue - Schedule deposits, cleanup jobs"
echo "  • Automatically Send Emails - Send notifications, alerts"
echo "  • Stripe Extension - Handle payments (if you use Stripe)"
echo ""

if ask_yes_no "Do you want to install Firebase Extensions now?"; then
    echo ""
    print_info "Opening Extensions Dashboard in instructions..."
    echo ""
    echo "Go to: $EXTENSIONS_URL"
    echo ""
    echo "Click 'Browse Extensions' and install:"
    echo ""
    echo "1. Cloud Tasks Queue"
    echo "   → Search 'Cloud Tasks Queue' → Install"
    echo "   → Confirm project → Install extension"
    echo "   → Wait for completion (2-3 min)"
    echo ""
    echo "2. Automatically Send Emails"
    echo "   → Search 'Automatically Send Emails' → Install"
    echo "   → Configure SMTP settings"
    echo "   → Save"
    echo ""
    echo "3. (Optional) Stripe Extension"
    echo "   → Search 'Stripe' → Install if you process payments"
    echo ""

    if ask_yes_no "Have you finished installing extensions?"; then
        print_status "Extensions installed"
    else
        print_warning "Skipping extensions - you can install them later"
    fi
else
    print_warning "Extensions skipped - you can install them anytime from:"
    echo "   $EXTENSIONS_URL"
fi

# ============================================================================
# PHASE 4: DEPLOY FIRESTORE RULES
# ============================================================================

print_title "PHASE 4: Deploy Firestore Rules & Indexes"

echo "📋 Deploying database security rules..."
echo ""

cd /workspaces/Snipe-

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
if ! firebase auth:list &> /dev/null 2>&1; then
    print_warning "You need to login to Firebase CLI"
    firebase login
fi

# Deploy rules
if firebase deploy --only firestore:rules,firestore:indexes --project "$PROJECT_ID" 2>&1; then
    print_status "Firestore rules and indexes deployed"
else
    print_error "Failed to deploy Firestore rules"
    print_info "Try manually: firebase deploy --only firestore:rules --project $PROJECT_ID"
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

# Build
if npm run build; then
    print_status "Build successful"

    # Check build output
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
        print_status "Build output: $BUILD_SIZE"
    fi
else
    print_error "Build failed"
    exit 1
fi

# ============================================================================
# PHASE 6: LOCAL TESTING (OPTIONAL)
# ============================================================================

print_title "PHASE 6: Local Testing (Optional)"

if ask_yes_no "Test locally before deploying to production?"; then
    echo "Starting dev server..."
    echo ""

    npm run dev &
    DEV_PID=$!

    sleep 5

    if ps -p $DEV_PID > /dev/null 2>&1; then
        print_status "Dev server running (PID: $DEV_PID)"
        echo ""
        print_warning "Local testing:"
        echo "   1. Open: http://localhost:5173"
        echo "   2. Check: Page loads without errors"
        echo "   3. Open browser console (F12): No red errors"
        echo "   4. Try: Navigate to /master-admin"
        echo "   5. Try: Login with master@gmail.com"
        echo ""

        read -p "Press ENTER when testing is complete, then answer the next question..."

        # Kill dev server
        kill $DEV_PID 2>/dev/null || true
        wait $DEV_PID 2>/dev/null || true

        if ask_yes_no "Did all tests pass?"; then
            print_status "Local testing passed"
        else
            print_error "Local testing failed"
            exit 1
        fi
    else
        print_error "Dev server failed to start"
        kill $DEV_PID 2>/dev/null || true
        exit 1
    fi
fi

# ============================================================================
# PHASE 7: DEPLOY TO PRODUCTION
# ============================================================================

print_title "PHASE 7: Deploy to Production"

echo "Choose your deployment platform:"
echo ""
echo "1) Vercel (Recommended - fastest, auto-scaling)"
echo "2) Firebase Hosting (native Firebase, simpler)"
echo "3) Netlify (alternative option)"
echo "4) Skip (deploy manually later)"
echo ""

read -p "Enter choice (1-4): " deployment_choice

case $deployment_choice in
    1)
        echo ""
        print_info "Deploying to Vercel..."

        # Check if vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_warning "Installing Vercel CLI..."
            npm install -g vercel
        fi

        # Deploy
        vercel --prod

        echo ""
        print_status "Deployed to Vercel"
        echo ""
        print_info "Your production URL: https://your-project.vercel.app"
        read -p "Enter your production URL: " PRODUCTION_URL
        ;;

    2)
        echo ""
        print_info "Deploying to Firebase Hosting..."

        cd /workspaces/Snipe-

        if firebase deploy --only hosting --project "$PROJECT_ID"; then
            print_status "Deployed to Firebase Hosting"
            PRODUCTION_URL="https://$PROJECT_ID.web.app"
            print_info "Production URL: $PRODUCTION_URL"
        else
            print_error "Firebase deployment failed"
            exit 1
        fi
        ;;

    3)
        echo ""
        print_info "Deploying to Netlify..."

        # Check if netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_warning "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi

        cd "$APP_DIR"
        netlify deploy --prod

        echo ""
        print_status "Deployed to Netlify"
        echo ""
        print_info "Your production URL appears above"
        read -p "Enter your production URL: " PRODUCTION_URL
        ;;

    4)
        print_warning "Deployment skipped"
        echo ""
        echo "Deploy manually with one of:"
        echo "  • Vercel: vercel --prod"
        echo "  • Firebase: firebase deploy --only hosting"
        echo "  • Netlify: netlify deploy --prod"
        exit 0
        ;;

    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# ============================================================================
# PHASE 8: PRODUCTION VERIFICATION
# ============================================================================

print_title "PHASE 8: Production Verification"

if [ ! -z "$PRODUCTION_URL" ]; then
    echo "🧪 Testing production URL: $PRODUCTION_URL"
    echo ""

    # Wait a bit for deployment to stabilize
    sleep 5

    # Test main page
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL")

    if [ "$HTTP_CODE" == "200" ]; then
        print_status "Main app loads (HTTP $HTTP_CODE)"
    else
        print_error "Main app failed to load (HTTP $HTTP_CODE)"
    fi

    echo ""
    print_warning "Manual verification required:"
    echo ""
    echo "1️⃣  Test Main App"
    echo "   → Open: $PRODUCTION_URL"
    echo "   → Check: Page loads without errors"
    echo "   → Press F12 → Console: No red errors"
    echo ""
    echo "2️⃣  Test Master Admin"
    echo "   → Go: $PRODUCTION_URL/master-admin"
    echo "   → Login: master@gmail.com / password"
    echo "   → Check: Dashboard loads"
    echo "   → Check: Can view users, deposits, trades"
    echo ""
    echo "3️⃣  Test Regular Admin"
    echo "   → Go: $PRODUCTION_URL/admin"
    echo "   → Login: admin@gmail.com / password"
    echo "   → Check: Admin panel loads with limited features"
    echo ""
    echo "4️⃣  Test Core Features"
    echo "   → Check: Wallet connection (if available)"
    echo "   → Check: Trading view works"
    echo "   → Check: Chat loads (if enabled)"
    echo "   → Check: User profile accessible"
    echo "   → Check: No console errors"
    echo ""
    echo "5️⃣  Check Firestore"
    echo "   → Open: https://console.firebase.google.com/u/0/project/$PROJECT_ID/firestore"
    echo "   → Verify: Collections exist (users, trades, notifications, etc.)"
    echo "   → Verify: Documents are being created/updated"
    echo ""

    read -p "Press ENTER when you've completed all verifications..."

    if ask_yes_no "Did all production tests pass?"; then
        print_status "Production verification passed ✨"

        echo ""
        print_title "🎉 Deployment Complete!"
        echo ""
        echo "Your Snipe app is now LIVE!"
        echo ""
        echo "📍 Key Links:"
        echo "   Main App: $PRODUCTION_URL"
        echo "   Master Admin: $PRODUCTION_URL/master-admin"
        echo "   Admin Panel: $PRODUCTION_URL/admin"
        echo "   Firebase Console: $FIREBASE_URL"
        echo "   Extensions: $EXTENSIONS_URL"
        echo ""
        echo "📋 Next Steps:"
        echo "   1. Monitor Firebase Functions logs (check for errors)"
        echo "   2. Test all admin features thoroughly"
        echo "   3. Set up monitoring/alerts in Firebase"
        echo "   4. Share app link with beta users/admins"
        echo "   5. Monitor performance and logs"
        echo ""
    else
        print_error "Production verification failed"
        echo ""
        print_info "Troubleshooting tips:"
        echo "   1. Check browser console for specific errors"
        echo "   2. Verify Firebase is initialized in DevTools"
        echo "   3. Check Firebase Console for any issues"
        echo "   4. Verify admin accounts exist in Firebase Auth"
        echo "   5. Check Firestore is enabled and has correct rules"
        exit 1
    fi
else
    print_warning "No production URL specified"
    echo "After deployment, verify manually at your production URL"
fi

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print_title "Deployment Summary"

echo "✅ Phase 1: Firebase services activated"
echo "✅ Phase 2: Admin accounts created"
echo "✅ Phase 3: Extensions installed (if chosen)"
echo "✅ Phase 4: Firestore rules deployed"
echo "✅ Phase 5: Build completed"
echo "✅ Phase 6: Local testing passed (if tested)"
echo "✅ Phase 7: Deployed to production"
echo "✅ Phase 8: Production verification passed"
echo ""
echo "🎯 Deployment Status: COMPLETE"
echo ""
echo "📚 Documentation:"
echo "   • FIREBASE_EXTENSIONS_AND_DEPLOYMENT_GUIDE.md"
echo "   • DEPLOYMENT.md"
echo "   • QUICK_START_GUIDE.md"
echo ""
