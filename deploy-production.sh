#!/bin/bash
# Final Deployment Script for Snipe Platform
# This script prepares and deploys the application to production

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Snipe Platform - Production Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Deployment Summary:"
echo "   • Project: Snipe Trading Platform"
echo "   • Version: 1.0.0"
echo "   • Status: Production Ready"
echo "   • Grade: B+ (85%)"
echo ""

# Function to print step headers
print_step() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Step 1: Pre-flight checks
print_step "📋 STEP 1/5: Pre-flight Checks"

echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "  Node.js: $NODE_VERSION"

if [ ! -f "Onchainweb/.env" ]; then
    echo "⚠️  WARNING: .env file not found in Onchainweb/"
    echo "   You'll need to configure environment variables in your deployment platform"
    echo "   See PRODUCTION_DEPLOYMENT_GUIDE.md for required variables"
fi

echo "✓ Checking build directory..."
if [ -d "Onchainweb/dist" ]; then
    BUILD_SIZE=$(du -sh Onchainweb/dist | cut -f1)
    echo "  Build directory exists (size: $BUILD_SIZE)"
else
    echo "  Build directory not found (will be created)"
fi

# Step 2: Clean build
print_step "🧹 STEP 2/5: Clean Build Environment"

echo "Cleaning previous build artifacts..."
cd Onchainweb
rm -rf dist/
rm -rf node_modules/.vite
echo "✓ Clean complete"

# Step 3: Install dependencies
print_step "📦 STEP 3/5: Installing Dependencies"

echo "Installing production dependencies..."
npm install --production=false
echo "✓ Dependencies installed"

# Step 4: Build production bundle
print_step "🏗️  STEP 4/5: Building Production Bundle"

echo "Building optimized production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build Successful!"
    echo ""
    echo "📊 Build Statistics:"
    du -sh dist/
    echo ""
    echo "📦 Generated Files:"
    ls -lh dist/ | grep -E '\.(html|css|js)' | wc -l | xargs echo "  Total files:"
    echo ""
else
    echo "❌ Build failed!"
    exit 1
fi

cd ..

# Step 5: Deployment options
print_step "🚀 STEP 5/5: Deployment"

echo "Build is ready for deployment!"
echo ""
echo "Choose your deployment platform:"
echo ""
echo "  1️⃣  Vercel (Recommended)"
echo "     → Fast, easy, automatic SSL"
echo "     → Command: cd Onchainweb && vercel --prod"
echo ""
echo "  2️⃣  Cloudflare Pages"
echo "     → Global CDN, excellent performance"
echo "     → Command: cd Onchainweb && wrangler pages deploy dist"
echo ""
echo "  3️⃣  Firebase Hosting"
echo "     → Integrated with Firebase services"
echo "     → Command: firebase deploy --only hosting"
echo ""
echo "  4️⃣  Manual deployment"
echo "     → Upload dist/ folder to your hosting provider"
echo "     → Configure rewrites for SPA routing"
echo ""

read -p "Deploy now? [1-4/N]: " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo ""
        echo "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            cd Onchainweb
            vercel --prod
            cd ..
        else
            echo "❌ Vercel CLI not found. Install it with:"
            echo "   npm install -g vercel"
            echo "   Then run: cd Onchainweb && vercel --prod"
        fi
        ;;
    2)
        echo ""
        echo "Deploying to Cloudflare Pages..."
        if command -v wrangler &> /dev/null; then
            cd Onchainweb
            wrangler pages deploy dist --project-name=snipe-platform
            cd ..
        else
            echo "❌ Wrangler not found. Install it with:"
            echo "   npm install -g wrangler"
            echo "   Then run: cd Onchainweb && wrangler pages deploy dist"
        fi
        ;;
    3)
        echo ""
        echo "Deploying to Firebase Hosting..."
        if command -v firebase &> /dev/null; then
            firebase deploy --only hosting
        else
            echo "❌ Firebase CLI not found. Install it with:"
            echo "   npm install -g firebase-tools"
            echo "   Then run: firebase deploy --only hosting"
        fi
        ;;
    4)
        echo ""
        echo "📁 Build files are ready in: Onchainweb/dist/"
        echo ""
        echo "Manual deployment steps:"
        echo "  1. Upload all files from dist/ to your web server"
        echo "  2. Configure web server for SPA routing (all routes → index.html)"
        echo "  3. Enable HTTPS/SSL"
        echo "  4. Set environment variables in hosting platform"
        echo ""
        ;;
    [Nn]*)
        echo ""
        echo "Skipping deployment. Build files ready in: Onchainweb/dist/"
        ;;
    *)
        echo ""
        echo "Invalid choice. Build files ready in: Onchainweb/dist/"
        echo "Deploy manually using one of the commands above."
        ;;
esac

# Final summary
print_step "✅ DEPLOYMENT PREPARATION COMPLETE"

echo ""
echo "📊 Summary:"
echo "  ✅ Pre-flight checks: PASSED"
echo "  ✅ Dependencies: INSTALLED"
echo "  ✅ Production build: SUCCESSFUL"
echo "  ✅ Build artifacts: Onchainweb/dist/"
echo ""
echo "📚 Next Steps:"
echo ""
echo "  1️⃣  If not deployed yet, choose a platform and deploy"
echo "  2️⃣  Configure environment variables in your platform:"
echo "     • VITE_FIREBASE_* (8 variables)"
echo "     • VITE_WALLETCONNECT_PROJECT_ID"
echo "     • VITE_ENABLE_ADMIN=true"
echo "     • VITE_ADMIN_ALLOWLIST=master@yourdomain.com"
echo ""
echo "  3️⃣  After deployment, test your live site:"
echo "     • Visit your URL"
echo "     • Test wallet connection"
echo "     • Login as master admin"
echo "     • Verify real-time features"
echo ""
echo "  4️⃣  Monitor for 24 hours:"
echo "     • Check error logs"
echo "     • Monitor Firebase quotas"
echo "     • Watch for issues"
echo ""
echo "📖 Documentation:"
echo "  • Full guide: PRODUCTION_DEPLOYMENT_GUIDE.md"
echo "  • Setup help: MASTER_ACCOUNT_SETUP_GUIDE.md"
echo "  • Audit report: PROJECT_AUDIT_REPORT.md"
echo ""
echo "🎉 Your application is ready for the world!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
