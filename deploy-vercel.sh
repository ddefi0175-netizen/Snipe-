#!/bin/bash
# Complete Vercel deployment script for onchainweb.site

set -e

echo "🚀 Deploying to Vercel (onchainweb.site)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Run pre-deployment checks
echo "📋 Step 1/5: Pre-deployment Checks"
./pre-deploy-checklist.sh || exit 1

# Step 2: Deploy Firestore rules
echo "🔥 Step 2/5: Deploy Firestore Rules"
./deploy-firestore-rules.sh || exit 1

# Step 3: Build application
echo "🏗️  Step 3/5: Building Application"
cd Onchainweb
npm install
npm run build
cd ..

# Step 4: Deploy to Vercel
echo "📤 Step 4/5: Deploying to Vercel"
cd Onchainweb
vercel --prod --yes
cd ..

# Step 5: Post-deployment tests
echo "✅ Step 5/5: Post-deployment Tests"
./test-post-deployment.sh "https://onchainweb.site"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Live at: https://onchainweb.site"
echo "🔐 Master Admin: https://onchainweb.site/master-admin"
echo ""
echo "📋 Next Steps:"
echo "1. Create master account in Firebase Console"
echo "2. Email: master@onchainweb.site"
echo "3. Use secure password (see MASTER_ACCOUNT_SETUP.md)"
