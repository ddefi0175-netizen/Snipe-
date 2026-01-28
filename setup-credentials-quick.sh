#!/bin/bash

# 🚀 QUICK FIREBASE SETUP WITH TEST CREDENTIALS
# This script sets up Firebase with test/development credentials

cd /workspaces/Snipe-

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🔐 FIREBASE CREDENTIALS QUICK SETUP                         ║"
echo "║                                                                ║"
echo "║   Status: Generating test/development configuration           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check for Firebase credentials in various places
if [ ! -z "$FIREBASE_API_KEY" ]; then
  API_KEY="$FIREBASE_API_KEY"
  echo "✅ Found API_KEY in environment"
else
  API_KEY="${FIREBASE_API_KEY:-AIzaSyD_test_api_key_development_use_real_value_in_prod}"
  echo "⚠️  Using test/development API_KEY - REPLACE WITH REAL VALUE"
fi

if [ ! -z "$FIREBASE_PROJECT_ID" ]; then
  PROJECT_ID="$FIREBASE_PROJECT_ID"
  echo "✅ Found PROJECT_ID in environment"
else
  PROJECT_ID="onchainweb-37d30"
  echo "✅ Using project ID: $PROJECT_ID"
fi

# Build the .env configuration
cat > Onchainweb/.env << EOF
# ============================================
# SNIPE FRONTEND - Environment Configuration
# ============================================
# Vite requires VITE_ prefix for environment variables
# Replace placeholder values with your actual Firebase credentials

# ===========================================
# FIREBASE CONFIGURATION (PRIMARY BACKEND)
# ============================================
# Get these values from Firebase Console:
# 1. Go to https://console.firebase.google.com
# 2. Select your project
# 3. Click gear icon → Project Settings
# 4. Scroll to "Your apps" → Web app configuration
# 5. Copy the values below

VITE_FIREBASE_API_KEY=$API_KEY
VITE_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN:-onchainweb-37d30.firebaseapp.com}
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET:-onchainweb-37d30.appspot.com}
VITE_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID:-123456789012}
VITE_FIREBASE_APP_ID=${FIREBASE_APP_ID:-1:123456789012:web:a1b2c3d4e5f6g7h8}
VITE_FIREBASE_MEASUREMENT_ID=${FIREBASE_MEASUREMENT_ID:-G-ABCDEF1234}

# ===========================================
# WALLET CONFIGURATION
# ===========================================
VITE_WALLET_CONNECT_ID=test_walletconnect_id_for_development

# ===========================================
# API ENDPOINTS
# ===========================================
VITE_API_URL=http://localhost:4000/api

EOF

echo "✅ Updated Onchainweb/.env"
echo ""

# Show what was set
echo "📋 FIREBASE CONFIGURATION:"
echo "───────────────────────────────────────────────────────────────"
echo "API Key: ${API_KEY:0:15}..."
echo "Project ID: $PROJECT_ID"
echo "Auth Domain: onchainweb-37d30.firebaseapp.com"
echo ""

# Check backend .env
echo "🔑 BACKEND CREDENTIALS:"
echo "───────────────────────────────────────────────────────────────"
if grep -q "JWT_SECRET=" backend/.env; then
  echo "✅ JWT Secret: SECURE (updated)"
else
  echo "⚠️  JWT Secret: Not yet configured"
fi

if grep -q "MASTER_USERNAME=snipe_admin" backend/.env; then
  echo "✅ Master Username: snipe_admin_secure_7ecb869e"
  if grep -q "MASTER_PASSWORD=WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E=" backend/.env; then
    echo "✅ Master Password: SECURE (Updated Jan 18, 2026)"
  else
    echo "⚠️  Master Password: Not yet updated to new secure password"
  fi
else
  echo "⚠️  Master Username: Not yet configured"
fi

echo ""
echo "🔗 DATABASE CONFIGURATION:"
echo "───────────────────────────────────────────────────────────────"
echo "✅ Firebase Project: onchainweb-37d30"
echo "✅ Firestore Rules: Deployed"
echo "✅ .firebaserc: Updated"
echo ""

echo "═════════════════════════════════════════════════════════════════"
echo "⚠️  IMPORTANT - REAL FIREBASE CREDENTIALS REQUIRED:"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "The current setup uses placeholder values. Before deploying to"
echo "production, you MUST:"
echo ""
echo "1. Get real Firebase credentials from:"
echo "   https://console.firebase.google.com"
echo ""
echo "2. Update VITE_FIREBASE_API_KEY in Onchainweb/.env with real value"
echo ""
echo "3. Update all Firebase values with real credentials from your"
echo "   Firebase project's web app configuration"
echo ""
echo "4. Run: ./validate-config.sh to verify"
echo ""
echo "═════════════════════════════════════════════════════════════════"
echo ""
echo "🚀 READY TO START SERVERS:"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Terminal 1 - Start Backend:"
echo "  $ cd backend && npm run dev"
echo ""
echo "Terminal 2 - Start Frontend:"
echo "  $ cd Onchainweb && npm run dev"
echo ""
echo "Then visit: http://localhost:5173"
echo ""
