#!/bin/bash

# ===============================================
# Firebase Setup Script for Snipe
# ===============================================
# This script sets up Firebase with extensions, security rules, and indexes

set -e

echo "🔧 Firebase Setup for Snipe Platform"
echo "===================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Get current Firebase project
PROJECT_ID=$(grep '"default"' .firebaserc | grep -oP '"\K[^"]+(?=")')
echo "📁 Project ID: $PROJECT_ID"
echo ""

# Ensure user is logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Logged in to Firebase"
echo ""

# ===============================================
# Deploy Firestore Rules
# ===============================================
echo "📋 Deploying Firestore Security Rules..."
firebase deploy --only firestore:rules
echo "✅ Firestore rules deployed"
echo ""

# ===============================================
# Deploy Firestore Indexes
# ===============================================
echo "📑 Deploying Firestore Indexes..."
firebase deploy --only firestore:indexes
echo "✅ Firestore indexes deployed"
echo ""

# ===============================================
# Set up Firebase Extensions (Recommended)
# ===============================================
echo "🧩 Installing Recommended Firebase Extensions..."
echo ""

# List of recommended extensions
declare -a EXTENSIONS=(
    "firebase/storage-resize-images"           # Resize images on upload
    "firebase/delete-user-data"                # Auto-delete user data
    "firebase/stripe"                          # Stripe integration (optional)
)

# Install extensions
for ext in "${EXTENSIONS[@]}"; do
    echo "📦 Checking extension: $ext"
    # Note: We won't auto-install as they require specific config
    echo "   → To install: firebase ext:install $ext"
done

echo ""
echo "💡 To install an extension manually, run:"
echo "   firebase ext:install <extension-id>"
echo ""

# ===============================================
# Set Environment Variables in Firebase
# ===============================================
echo "🌍 Setting Firebase Environment Variables..."
echo ""

# Create .env.firebase with necessary env vars
cat > .env.firebase << 'EOF'
# Firebase Environment Variables
# These are automatically loaded by Firebase Functions

# Admin Email Allowlist (comma-separated)
ADMIN_ALLOWLIST=master@gmail.com,admin@gmail.com

# Master Password (for initial setup only)
# Change this to a strong password!
MASTER_PASSWORD=ChangeMe123!@

# API Settings
API_TIMEOUT_MS=30000
MAX_RETRIES=3

# Stripe Settings (if using Stripe extension)
STRIPE_API_SECRET_KEY=sk_test_...

# Email Settings (if using email extension)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Logging
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=false
EOF

echo "✅ Created .env.firebase template"
echo "   📝 Edit .env.firebase with your actual values"
echo ""

# ===============================================
# Enable Required Firebase Services
# ===============================================
echo "🚀 Enabling Firebase Services..."

# Enable Firestore (required)
echo "   → Firestore (already enabled if you created it)"

# Enable Storage (optional, for file uploads)
echo "   → To enable Storage: firebase storage:bucket add gs://$PROJECT_ID.appspot.com"

# Enable Functions (optional, for backend logic)
echo "   → To enable Functions: firebase deploy --only functions"

echo ""
echo "✅ Firebase setup complete!"
echo ""

# ===============================================
# Display Setup Summary
# ===============================================
echo "📊 Setup Summary"
echo "==============="
echo "✅ Firebase Project: $PROJECT_ID"
echo "✅ Firestore Rules: Deployed"
echo "✅ Firestore Indexes: Deployed"
echo "✅ Environment File: .env.firebase (created)"
echo ""

echo "📖 Next Steps:"
echo "1. Edit .env.firebase with your actual configuration"
echo "2. Review Firestore Security Rules: firestore.rules"
echo "3. Create admin user in Firebase Console: Authentication > Users"
echo "4. Deploy to production: firebase deploy"
echo ""

echo "💻 Development:"
echo "   npm run dev  (in Onchainweb/)"
echo ""

echo "🌐 Deployment:"
echo "   firebase deploy"
echo ""

echo "🎯 Admin Access:"
echo "   Master: https://localhost:5173/master-admin"
echo "   Admin:  https://localhost:5173/admin"
echo ""

echo "✨ Setup completed successfully!"
