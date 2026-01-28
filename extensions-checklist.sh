#!/bin/bash

# Firebase Extensions Setup Checklist
# Copy & paste this into your terminal to track progress

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   Firebase Extensions Setup Checklist                         ║"
echo "║   Project: YOUR_FIREBASE_PROJECT_ID                                   ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Create a checklist file
cat > /tmp/extensions-checklist.txt << 'EOF'
FIREBASE EXTENSIONS SETUP CHECKLIST
====================================

Phase 1: Delete ERRORED Extension
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Open Firebase Console
    URL: https://console.firebase.google.com/project/YOUR_FIREBASE_PROJECT_ID/extensions

[ ] Find "Trigger Email from Firestore" extension (ERRORED state)

[ ] Click the extension to open it

[ ] Click 3-dot menu (⋮) in top right

[ ] Select "Delete extension"

[ ] Confirm deletion

[ ] ⏱️  Wait 3-5 minutes for deletion to complete

[ ] Verify it's gone from the extensions list


Phase 2: Reinstall Email Extension
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Run installation command:
    firebase ext:install firebase/firestore-send-email --project=YOUR_FIREBASE_PROJECT_ID

[ ] Select asia-east2 as location ⚠️ CRITICAL!

[ ] Select "Username & Password" for auth

[ ] Press Enter for SMTP connection URI (skip)

[ ] Enter "mail" for email collection

[ ] Enter "noreply@onchainweb.app" for FROM

[ ] Press Enter for REPLY-TO (skip)

[ ] Enter "users" for users collection

[ ] Press Enter for templates (skip)

[ ] Type "y" to proceed with installation

[ ] ⏱️  Wait for installation to complete


Phase 3: Verify Email Extension
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Run verification:
    firebase ext:list --project=YOUR_FIREBASE_PROJECT_ID

[ ] Confirm firestore-send-email shows ACTIVE ✅

[ ] Confirm storage-resize-images shows ACTIVE ✅


Phase 4: Install Delete User Data Extension
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Run installation command:
    firebase ext:install firebase/delete-user-data --project=YOUR_FIREBASE_PROJECT_ID

[ ] Select asia-east2 as location

[ ] Enter Firestore paths:
    users/{UID},userProfiles/{UID},userActivity/{UID},trades/{UID}

[ ] Select "recursive" for delete mode

[ ] Press Enter for other fields (skip)

[ ] Type "y" to proceed


Phase 5: Deploy Cloud Functions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Run:
    cd functions

[ ] Install dependencies:
    npm install

[ ] Go back:
    cd ..

[ ] Deploy functions:
    firebase deploy --only functions --project=YOUR_FIREBASE_PROJECT_ID

[ ] ⏱️  Wait for deployment to complete


Phase 6: Final Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Verify extensions:
    firebase ext:list --project=YOUR_FIREBASE_PROJECT_ID

    Expected output:
    ✅ firestore-send-email ........... ACTIVE
    ✅ delete-user-data ............... ACTIVE
    ✅ storage-resize-images .......... ACTIVE

[ ] Verify Cloud Functions:
    firebase functions:list --project=YOUR_FIREBASE_PROJECT_ID

    Expected functions:
    ✅ bulkDeleteDocuments
    ✅ scheduledDataCleanup
    ✅ cleanupUserData

[ ] 🎉 ALL COMPLETE!


NOTES & TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: "Database doesn't exist in region us-central1"
Fix: You didn't select asia-east2. Delete and retry.

Issue: SMTP errors
Fix: Just press Enter to skip. Configure later.

Issue: Installation hangs
Fix: Ctrl+C, wait 5 minutes, try again.

Issue: Can't delete from CLI
Fix: Must delete from Firebase Console (web)

Questions? See QUICK_FIX_EXTENSIONS.md for detailed instructions.

EOF

# Display the checklist
cat /tmp/extensions-checklist.txt

# Offer to save it
echo ""
echo "📋 Checklist saved to: /tmp/extensions-checklist.txt"
echo ""
echo "💡 TIP: Open this file in another terminal and check off items as you go!"
echo ""
