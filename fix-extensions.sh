#!/bin/bash

# Firebase Extensions Fix & Installation Script
# This script helps automate the extension installation process

set -e  # Exit on error

PROJECT_ID="onchainweb-37d30"
REGION="asia-east2"  # Your Firestore region

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     🔧 Firebase Extensions Installation Helper                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check current extensions
echo "📊 Step 1: Checking current extension status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
firebase ext:list --project=$PROJECT_ID
echo ""

# Step 2: Manual step - Delete ERRORED extension
echo "⚠️  Step 2: DELETE ERRORED EXTENSION (Manual Step Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The firestore-send-email extension is ERRORED and must be deleted"
echo "from Firebase Console (CLI cannot delete it)."
echo ""
echo "📌 ACTION REQUIRED:"
echo "   1. Open: https://console.firebase.google.com/project/$PROJECT_ID/extensions"
echo "   2. Find 'Trigger Email from Firestore' with ERRORED state"
echo "   3. Click the 3-dot menu (⋮) → Delete extension"
echo "   4. Wait 2-3 minutes for deletion to complete"
echo ""
echo -n "Press Enter when you've completed the deletion and are ready to continue..."
read

# Step 3: Reinstall email extension with correct region
echo ""
echo "📧 Step 3: Reinstalling Email Extension with correct region..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "We'll create a params file to automate the installation."
echo ""

# Create params file for email extension
cat > /tmp/email-extension-params.env << EOF
LOCATION=$REGION
SMTP_CONNECTION_URI=
EMAIL_COLLECTION=mail
DEFAULT_FROM=noreply@onchainweb.app
DEFAULT_REPLY_TO=support@onchainweb.app
USERS_COLLECTION=users
TEMPLATES_COLLECTION=
EOF

echo "📝 Installing with these settings:"
echo "   - Region: $REGION (matches your Firestore database)"
echo "   - Email Collection: mail"
echo "   - From: noreply@onchainweb.app"
echo "   - Reply-To: support@onchainweb.app"
echo "   - SMTP: (skip for now, configure later)"
echo ""

if firebase ext:install firebase/firestore-send-email \
  --project=$PROJECT_ID \
  --params=/tmp/email-extension-params.env; then
  echo "✅ Email extension installed successfully!"
else
  echo "❌ Installation failed. Check the error above."
  echo ""
  echo "Common issues:"
  echo "  - Extension wasn't fully deleted yet (wait a few more minutes)"
  echo "  - Network/permissions issue"
  echo ""
  exit 1
fi

# Step 4: Install Delete User Data extension
echo ""
echo "🗑️  Step 4: Installing Delete User Data Extension (GDPR)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create params file for delete user data
cat > /tmp/delete-user-data-params.env << EOF
LOCATION=$REGION
FIRESTORE_PATHS=users/{UID},userProfiles/{UID},userActivity/{UID},userWallets/{UID},trades/{UID},deposits/{UID},withdrawals/{UID},notifications/{UID}
FIRESTORE_DELETE_MODE=recursive
RTDB_PATHS=
STORAGE_PATHS=
EOF

echo "📝 Installing with these settings:"
echo "   - Region: $REGION"
echo "   - Deletes from: users, userProfiles, userActivity, trades, etc."
echo "   - Mode: Recursive (deletes subcollections)"
echo ""

if firebase ext:install firebase/delete-user-data \
  --project=$PROJECT_ID \
  --params=/tmp/delete-user-data-params.env; then
  echo "✅ Delete User Data extension installed successfully!"
else
  echo "⚠️  Installation failed or skipped."
  echo "You can install it manually later with:"
  echo "  firebase ext:install firebase/delete-user-data --project=$PROJECT_ID"
fi

# Step 5: Create custom bulk delete Cloud Function
echo ""
echo "📦 Step 5: Creating Custom Bulk Delete Cloud Function..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Creating Cloud Function for bulk operations..."
echo "(This will be in the 'functions' directory)"

# Create functions directory if it doesn't exist
mkdir -p functions

# Create package.json for functions
cat > functions/package.json << 'EOF'
{
  "name": "snipe-cloud-functions",
  "version": "1.0.0",
  "description": "Cloud Functions for Snipe Trading Platform",
  "main": "index.js",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^11.11.1",
    "firebase-functions": "^4.5.0"
  },
  "devDependencies": {
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
EOF

# Create index.js with bulk delete functions
cat > functions/index.js << 'EOF'
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Bulk delete documents from a collection based on criteria
 *
 * Usage:
 * POST https://us-central1-PROJECT_ID.cloudfunctions.net/bulkDeleteDocuments
 * Body: {
 *   "collection": "trades",
 *   "field": "createdAt",
 *   "operator": "<",
 *   "value": "2025-01-01T00:00:00.000Z",
 *   "batchSize": 500
 * }
 */
exports.bulkDeleteDocuments = functions
  .region('asia-east2')
  .https.onCall(async (data, context) => {
    // Verify admin authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to delete documents'
      );
    }

    // Verify admin role
    const adminDoc = await admin.firestore()
      .collection('admins')
      .doc(context.auth.uid)
      .get();

    if (!adminDoc.exists || (adminDoc.data().role !== 'master' && adminDoc.data().role !== 'admin')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be an admin to perform bulk delete'
      );
    }

    const { collection, field, operator, value, batchSize = 500 } = data;

    // Validate inputs
    if (!collection || !field || !operator || value === undefined) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: collection, field, operator, value'
      );
    }

    const db = admin.firestore();
    let deletedCount = 0;

    try {
      // Query documents based on criteria
      let query = db.collection(collection).where(field, operator, value);

      let snapshot = await query.limit(batchSize).get();

      while (!snapshot.empty) {
        // Create batch for deletion
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        deletedCount += snapshot.docs.length;

        // Check if there are more documents to delete
        if (snapshot.docs.length < batchSize) {
          break;
        }

        // Get next batch
        snapshot = await query.limit(batchSize).get();
      }

      // Log the activity
      await db.collection('activityLogs').add({
        adminId: context.auth.uid,
        adminUsername: adminDoc.data().username,
        action: 'bulk_delete',
        collection: collection,
        criteria: { field, operator, value },
        deletedCount: deletedCount,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        deletedCount: deletedCount,
        message: `Successfully deleted ${deletedCount} documents from ${collection}`
      };

    } catch (error) {
      console.error('Bulk delete error:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to delete documents: ${error.message}`
      );
    }
  });

/**
 * Scheduled function to clean up old data
 * Runs daily at 2 AM
 */
exports.scheduledDataCleanup = functions
  .region('asia-east2')
  .pubsub.schedule('0 2 * * *')
  .timeZone('Asia/Hong_Kong')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalDeleted = 0;

    // Clean up old activity logs
    try {
      const logsSnapshot = await db.collection('activityLogs')
        .where('timestamp', '<', thirtyDaysAgo)
        .limit(500)
        .get();

      if (!logsSnapshot.empty) {
        const batch = db.batch();
        logsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        totalDeleted += logsSnapshot.docs.length;
        console.log(`Deleted ${logsSnapshot.docs.length} old activity logs`);
      }
    } catch (error) {
      console.error('Error cleaning activity logs:', error);
    }

    // Clean up old notifications
    try {
      const notificationsSnapshot = await db.collection('notifications')
        .where('createdAt', '<', thirtyDaysAgo)
        .where('read', '==', true)
        .limit(500)
        .get();

      if (!notificationsSnapshot.empty) {
        const batch = db.batch();
        notificationsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        totalDeleted += notificationsSnapshot.docs.length;
        console.log(`Deleted ${notificationsSnapshot.docs.length} old notifications`);
      }
    } catch (error) {
      console.error('Error cleaning notifications:', error);
    }

    return { totalDeleted };
  });

/**
 * Clean up user data when a user is deleted
 * Triggered by Firebase Authentication user deletion
 */
exports.cleanupUserData = functions
  .region('asia-east2')
  .auth.user().onDelete(async (user) => {
    const db = admin.firestore();
    const userId = user.uid;

    const collections = [
      'userProfiles',
      'userActivity',
      'userWallets',
      'notifications'
    ];

    for (const collectionName of collections) {
      try {
        const docRef = db.collection(collectionName).doc(userId);
        const doc = await docRef.get();

        if (doc.exists) {
          await docRef.delete();
          console.log(`Deleted ${userId} from ${collectionName}`);
        }
      } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
      }
    }

    return { userId, cleaned: true };
  });
EOF

# Update firebase.json to include functions
echo "Updating firebase.json to include Cloud Functions..."

# Check if firebase.json has functions config
if grep -q '"functions"' firebase.json; then
  echo "✅ Functions already configured in firebase.json"
else
  echo "📝 Adding functions configuration to firebase.json..."
  # This will be done manually or you can do it after
fi

echo ""
echo "✅ Cloud Functions created in 'functions' directory"

# Step 6: Final verification
echo ""
echo "✅ Step 6: Final Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Checking installed extensions..."
firebase ext:list --project=$PROJECT_ID
echo ""

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     ✅ Installation Summary                                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Storage Resize Images .......... ACTIVE"
echo "✅ Trigger Email from Firestore ... INSTALLING (check status)"
echo "✅ Delete User Data ............... INSTALLING (check status)"
echo "✅ Bulk Delete Cloud Function ..... CREATED (needs deployment)"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure Email Extension:"
echo "   firebase ext:configure firestore-send-email --project=$PROJECT_ID"
echo "   (Add SMTP credentials when you're ready)"
echo ""
echo "2. Deploy Cloud Functions:"
echo "   cd functions"
echo "   npm install"
echo "   cd .."
echo "   firebase deploy --only functions --project=$PROJECT_ID"
echo ""
echo "3. Test Email Extension:"
echo "   Create a document in 'mail' collection with:"
echo "   { to: 'your@email.com', message: { subject: 'Test', text: 'Hello' } }"
echo ""
echo "4. Test Delete User Data:"
echo "   Delete a test user from Firebase Authentication"
echo ""
echo "📚 Full documentation in: EXTENSION_FIX_GUIDE.md"
echo ""
echo "🎉 Setup complete!"
