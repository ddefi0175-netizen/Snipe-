#!/bin/bash

# Quick start script for Firebase Extensions setup

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     🚀 Firebase Extensions Quick Setup                        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will help you fix and install all Firebase Extensions."
echo ""
echo "Current Status:"
echo "  ✅ storage-resize-images .... ACTIVE"
echo "  ⚠️  firestore-send-email ..... ERRORED (needs fix)"
echo "  ❌ delete-user-data .......... NOT INSTALLED"
echo "  ❌ bulk-delete ............... CUSTOM FUNCTION (not extension)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 What we'll do:"
echo ""
echo "1. Open Firebase Console for you to delete ERRORED extension"
echo "2. Reinstall Email extension with correct region (asia-east2)"
echo "3. Install Delete User Data extension (GDPR compliance)"
echo "4. Create custom bulk delete Cloud Functions"
echo "5. Deploy everything"
echo ""
echo "⏱️  Estimated time: 10-15 minutes"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -n "Ready to start? (y/n): "
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
  echo "Setup cancelled. Run ./quick-setup.sh when you're ready."
  exit 0
fi

echo ""
echo "🌐 Opening Firebase Console..."
echo ""
echo "URL: https://console.firebase.google.com/project/onchainweb-37d30/extensions"
echo ""
echo "📋 ACTION REQUIRED:"
echo "  1. Find 'Trigger Email from Firestore' (ERRORED state)"
echo "  2. Click the 3-dot menu (⋮) in the top right"
echo "  3. Select 'Delete extension'"
echo "  4. Confirm deletion"
echo "  5. Wait 2-3 minutes for deletion to complete"
echo ""

# Try to open browser
if command -v xdg-open &> /dev/null; then
  xdg-open "https://console.firebase.google.com/project/onchainweb-37d30/extensions" 2>/dev/null &
elif command -v "$BROWSER" &> /dev/null; then
  "$BROWSER" "https://console.firebase.google.com/project/onchainweb-37d30/extensions" &
fi

echo -n "Press Enter when you've deleted the extension..."
read

echo ""
echo "✅ Great! Now running the main installation script..."
echo ""

# Run the main fix script
./fix-extensions.sh
