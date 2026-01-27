#!/bin/bash
# Complete Vercel deployment for onchainweb.site

set -e

echo "🚀 Snipe - Vercel Deployment (onchainweb.site)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Validate configuration
echo "📝 Step 1/5: Validating Configuration..."
if [ ! -f "./validate-config.sh" ]; then
  echo "⚠️  Warning: validate-config.sh not found, skipping validation"
elif [ ! -x "./validate-config.sh" ]; then
  echo "⚠️  Warning: validate-config.sh not executable, skipping validation"
else
  ./validate-config.sh || exit 1
fi

# Step 2: Build application
echo "🏗️  Step 2/5: Building Application..."
cd Onchainweb
npm install
npm run build
cd ..

# Step 3: Deploy Firestore rules
echo "🔥 Step 3/5: Deploying Firestore Rules..."
firebase deploy --only firestore:rules,firestore:indexes

# Step 4: Deploy to Vercel
echo "🚀 Step 4/5: Deploying to Vercel..."
cd Onchainweb
vercel --prod
cd ..

# Step 5: Setup master account
echo "👤 Step 5/5: Master Account Setup..."
echo ""
echo "Visit: https://onchainweb.site/master-admin"
echo "Email: master@onchainweb.site"
echo "Create a strong password (min 16 characters)"
echo ""
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
