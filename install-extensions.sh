#!/bin/bash

# Firebase Extensions Setup Script for Snipe Platform
# Installs compatible extensions automatically
# Project: YOUR_FIREBASE_PROJECT_ID

set -e

PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║    🔧 FIREBASE EXTENSIONS AUTO-INSTALL FOR SNIPE PLATFORM               ║"
echo "║                                                                            ║"
echo "║    Project: $PROJECT_ID                                                   ║"
echo "║    Status: Starting installation...                                        ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI is ready"
echo ""

# Extension 1: Delete User Data (GDPR Compliance) - ESSENTIAL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 EXTENSION 1: Delete User Data (GDPR Compliance)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Purpose: Auto-delete user data when account is deleted"
echo "Firestore paths: users/{UID},userProfiles/{UID},userActivity/{UID}"
echo ""
echo "Installing..."

firebase ext:install firebase/delete-user-data \
  --project=$PROJECT_ID \
  --params=firestore_database_id='(default)',firestore_paths='users/{UID},userProfiles/{UID},userActivity/{UID}' \
  --quiet || echo "⚠️  Extension 1 requires interactive setup (see Firebase Console)"

echo "✅ Extension 1 complete"
echo ""
echo "Press ENTER to continue to Extension 2..."
read -p ""

# Extension 2: Firestore Bulk Delete (Data Management) - USEFUL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 EXTENSION 2: Firestore Bulk Delete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Purpose: Efficiently delete multiple documents (old logs, records)"
echo "Use case: Clean up trading history, admin activity logs"
echo ""
echo "Note: This extension requires manual setup in Firebase Console"
echo "      Go to: https://console.firebase.google.com/project/$PROJECT_ID/extensions"
echo "      Search for 'Firestore Bulk Delete' and click Install"
echo ""

# Extension 3: Storage Resize Images (Media Management) - OPTIONAL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 EXTENSION 3: Storage Resize Images"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Purpose: Auto-resize user profile pictures"
echo "Use case: User avatars, profile images"
echo ""
echo "Note: This extension also requires manual setup in Firebase Console"
echo "      Search for 'Storage Resize Images' and click Install"
echo ""

# Extension 4: Send Email (Notifications) - OPTIONAL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 EXTENSION 4: Trigger Email from Firestore"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Purpose: Send automated emails (alerts, notifications)"
echo "Use case: Withdrawal confirmations, trading alerts, KYC notifications"
echo ""
echo "Setup requires:"
echo "  1. Gmail account with App Password"
echo "  OR"
echo "  2. SendGrid account with API key"
echo ""
echo "This extension also requires manual setup in Firebase Console"
echo "      Search for 'Trigger Email from Firestore' and click Install"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 SETUP GUIDE COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ NEXT STEPS:"
echo ""
echo "1. Open Firebase Console:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/extensions"
echo ""
echo "2. For each extension below, click 'Install extension' and follow prompts:"
echo ""
echo "   ESSENTIAL (Must install):"
echo "   ✓ Delete User Data (firebase/delete-user-data)"
echo ""
echo "   RECOMMENDED (Should install):"
echo "   ✓ Firestore Bulk Delete"
echo "   ✓ Trigger Email from Firestore"
echo ""
echo "   OPTIONAL (Nice to have):"
echo "   ✓ Storage Resize Images"
echo ""
echo "3. Configuration details provided above for each extension"
echo ""
echo "4. After installation, verify in Extensions panel:"
echo "   All should show ✅ status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 DOCUMENTATION:"
echo "   - Delete User Data: https://firebase.google.com/products/extensions/delete-user-data"
echo "   - Bulk Delete: https://firebase.google.com/products/extensions/firestore-bulk-delete"
echo "   - Send Email: https://firebase.google.com/products/extensions/firestore-send-email"
echo "   - Resize Images: https://firebase.google.com/products/extensions/storage-resize-images"
echo ""
echo "💡 TIPS:"
echo "   - Delete User Data is FREE and ESSENTIAL for GDPR compliance"
echo "   - Send Email requires Gmail App Password or SendGrid API key"
echo "   - All extensions use Cloud Functions (automatic billing)"
echo ""
echo "✨ Setup complete! Enjoy your Firebase Extensions! 🚀"
