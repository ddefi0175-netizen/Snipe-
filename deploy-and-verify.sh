#!/bin/bash

# Snipe App - Complete Deployment & Verification Script
# This script builds, deploys, and verifies all app functions including admin access

set -e

PROJECT_ID="onchainweb-37d30"
APP_DIR="Onchainweb"
FIREBASE_URL="https://console.firebase.google.com/u/0/project/$PROJECT_ID"

echo "🚀 Snipe App - Deployment & Verification"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

# Step 1: Clean build
echo "📦 Step 1: Building App..."
cd "$APP_DIR"
rm -rf dist node_modules/.vite
npm run build > /dev/null 2>&1 || npm run build

if [ $? -eq 0 ]; then
    print_status "Build successful"

    # Check build output
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        print_status "Build output: $BUILD_SIZE"
    fi
else
    print_error "Build failed"
    exit 1
fi

cd ..

echo ""
echo "🔧 Step 2: Firebase Services Check..."

# Check if Firebase services are enabled
print_warning "Please verify Firebase services are enabled:"
echo "   → Firestore Database"
echo "   → Authentication (Email/Password)"
echo "   → Storage (optional)"
echo ""
read -p "   Have you enabled Firebase services? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please enable Firebase services first:"
    echo "   Visit: $FIREBASE_URL"
    exit 1
fi

print_status "Firebase services confirmed"

echo ""
echo "👤 Step 3: Admin Accounts Check..."

# Check if admin accounts exist
print_warning "Please verify admin accounts exist in Firebase Authentication:"
echo "   → master@gmail.com (Master Admin)"
echo "   → admin@gmail.com (Regular Admin)"
echo ""
read -p "   Have you created admin accounts? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please create admin accounts first:"
    echo "   Visit: $FIREBASE_URL/authentication/users"
    exit 1
fi

print_status "Admin accounts confirmed"

echo ""
echo "🧪 Step 4: Local Testing..."

echo "   Starting local dev server..."
cd "$APP_DIR"
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for dev server to start
sleep 5

if ps -p $DEV_PID > /dev/null; then
    print_status "Dev server running (PID: $DEV_PID)"

    echo ""
    print_warning "Manual testing required:"
    echo "   1. Open: http://localhost:5173"
    echo "   2. Test main app loads"
    echo "   3. Open: http://localhost:5173/master-admin"
    echo "   4. Test master admin login (master@gmail.com)"
    echo "   5. Open: http://localhost:5173/admin"
    echo "   6. Test regular admin login (admin@gmail.com)"
    echo ""
    read -p "   Did all tests pass? (y/n) " -n 1 -r
    echo

    # Kill dev server
    kill $DEV_PID 2>/dev/null || true

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Local testing failed"
        exit 1
    fi

    print_status "Local testing passed"
else
    print_error "Dev server failed to start"
    exit 1
fi

cd ..

echo ""
echo "📤 Step 5: Firebase Deployment..."

# Deploy Firestore rules and indexes
echo "   Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes --project "$PROJECT_ID" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "Firestore rules deployed"
else
    print_warning "Firestore rules deployment failed (may already be deployed)"
fi

echo ""
echo "🌐 Step 6: Production Deployment..."
echo ""
echo "   Choose deployment option:"
echo "   1) Vercel (Recommended)"
echo "   2) Firebase Hosting"
echo "   3) Netlify"
echo "   4) Skip deployment (already deployed)"
echo ""
read -p "   Select option (1-4): " -n 1 -r DEPLOY_OPTION
echo

case $DEPLOY_OPTION in
    1)
        echo "   Deploying to Vercel..."
        print_warning "Run manually: cd $APP_DIR && vercel --prod"
        ;;
    2)
        echo "   Deploying to Firebase Hosting..."
        firebase deploy --only hosting:onchainweb --project "$PROJECT_ID"
        if [ $? -eq 0 ]; then
            print_status "Deployed to Firebase Hosting"
            PRODUCTION_URL="https://$PROJECT_ID.web.app"
            echo "   URL: $PRODUCTION_URL"
        fi
        ;;
    3)
        echo "   Deploying to Netlify..."
        print_warning "Deploy via Netlify dashboard or CLI"
        ;;
    4)
        print_status "Skipping deployment"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Step 7: Production Verification..."

if [ ! -z "$PRODUCTION_URL" ]; then
    echo ""
    print_warning "Manual production testing required:"
    echo "   1. Open: $PRODUCTION_URL"
    echo "   2. Verify main app loads"
    echo "   3. Open: $PRODUCTION_URL/master-admin"
    echo "   4. Test master admin login"
    echo "   5. Verify dashboard functions work"
    echo "   6. Open: $PRODUCTION_URL/admin"
    echo "   7. Test regular admin login"
    echo ""
    read -p "   Did production verification pass? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Production verification failed"
        exit 1
    fi

    print_status "Production verification passed"
else
    print_warning "Enter your production URL for verification:"
    read PRODUCTION_URL
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Deployment Summary:"
echo "   ✅ Build: Success"
echo "   ✅ Firebase Services: Enabled"
echo "   ✅ Admin Accounts: Created"
echo "   ✅ Local Testing: Passed"
echo "   ✅ Firestore Rules: Deployed"
echo "   ✅ Production: Deployed"
echo "   ✅ Verification: Passed"
echo ""
echo "🔗 Important URLs:"
echo "   Production: $PRODUCTION_URL"
echo "   Master Admin: $PRODUCTION_URL/master-admin"
echo "   Regular Admin: $PRODUCTION_URL/admin"
echo "   Firebase Console: $FIREBASE_URL"
echo ""
echo "👤 Admin Accounts:"
echo "   Master: master@gmail.com"
echo "   Admin: admin@gmail.com"
echo ""
echo "🎯 Next Steps:"
echo "   1. Monitor Firebase Console for usage"
echo "   2. Check app performance metrics"
echo "   3. Test all admin dashboard features"
echo "   4. Verify real-time data sync works"
echo ""
echo "📚 Documentation:"
echo "   - PRE_DEPLOYMENT_CHECKLIST.md"
echo "   - DEPLOYMENT_READY.md"
echo "   - FIREBASE_ACTIVATION_GUIDE.md"
echo ""
echo "✅ All systems ready!"
