#!/bin/bash
# Complete deployment orchestration script

set -e

echo "🚀 Snipe - Complete Deployment Workflow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Environment Setup (5 min)
echo "📝 Step 1/5: Validating Environment Variables..."
./validate-config.sh || exit 1
echo "✅ Environment validated"
echo ""

# Step 2: Pre-deployment Checks (3 min)
echo "🔍 Step 2/5: Running Pre-deployment Checks..."
./pre-deploy-checklist.sh || exit 1
echo ""

# Step 3: Deploy Firestore Rules (2 min)
echo "🔥 Step 3/5: Deploying Firestore Rules..."
./deploy-firestore-rules.sh || exit 1
echo ""

# Step 4: Deploy Application (5 min)
echo "🏗️  Step 4/5: Deploying Application..."
echo ""
echo "Select deployment platform:"
echo "1. Firebase Hosting"
echo "2. Vercel"
echo "3. Cloudflare Pages"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Deploying to Firebase Hosting..."
        firebase deploy --only hosting
        DEPLOYED_URL="https://$(grep '"default"' .firebaserc | grep -oP '"\K[^"]+').web.app"
        ;;
    2)
        echo "Deploying to Vercel..."
        cd Onchainweb && vercel --prod | tee /tmp/vercel.log
        DEPLOYED_URL=$(grep "https://" /tmp/vercel.log | tail -1)
        cd ..
        ;;
    3)
        echo "Deploying to Cloudflare Pages..."
        cd Onchainweb && wrangler pages deploy dist
        DEPLOYED_URL="https://snipe.pages.dev"
        cd ..
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
echo ""

# Step 5: Post-deployment Verification (10 min)
echo "✅ Step 5/5: Running Post-deployment Tests..."
./test-post-deployment.sh "$DEPLOYED_URL" || true
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Deployed to: $DEPLOYED_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Visit: $DEPLOYED_URL"
echo "2. Navigate to: $DEPLOYED_URL/master-admin"
echo "3. Create master account with email from VITE_ADMIN_ALLOWLIST"
echo "4. Test wallet connection"
echo "5. Monitor logs for 24 hours"
echo ""
echo "🔐 Master Account Setup:"
echo "   Email: Use first email from VITE_ADMIN_ALLOWLIST"
echo "   Password: Create a strong password (min 12 characters)"
echo "   Save credentials securely!"
