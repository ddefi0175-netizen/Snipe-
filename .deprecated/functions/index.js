const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();

/**
 * REAL-TIME USER MANAGEMENT FUNCTIONS
 * Master/Admin control for user data
 */

/**
 * Update user status in real-time database
 * Accessible only by master/admin
 */
exports.updateUserStatus = functions
  .region('asia-east2')
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    // Verify admin role
    const adminDoc = await db
      .collection('admins')
      .doc(context.auth.uid)
      .get();

    if (!adminDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be an admin to manage users'
      );
    }

    const adminData = adminDoc.data();
    if (adminData.role !== 'master' && adminData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient permissions'
      );
    }

    const { userId, status, userData } = data;

    if (!userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userId is required'
      );
    }

    try {
      // Update in Firestore
      await db.collection('users').doc(userId).update({
        status: status || 'active',
        lastModified: admin.firestore.FieldValue.serverTimestamp(),
        modifiedBy: context.auth.uid,
        ...userData
      });

      // Update in Realtime Database for real-time sync
      await rtdb.ref(`users/${userId}`).update({
        status: status || 'active',
        lastModified: admin.database.ServerValue.TIMESTAMP,
        modifiedBy: context.auth.uid
      });

      // Log activity
      await db.collection('activityLogs').add({
        adminId: context.auth.uid,
        adminUsername: adminData.username,
        action: 'update_user_status',
        userId: userId,
        status: status,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: `User ${userId} updated successfully`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to update user: ${error.message}`
      );
    }
  });

/**
 * Freeze/Unfreeze user account
 * Only master can do this
 */
exports.freezeUserAccount = functions
  .region('asia-east2')
  .https.onCall(async (data, context) => {
    // Verify master authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    const adminDoc = await db
      .collection('admins')
      .doc(context.auth.uid)
      .get();

    if (!adminDoc.exists || adminDoc.data().role !== 'master') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only master can freeze accounts'
      );
    }

    const { userId, frozen, reason } = data;

    if (!userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userId is required'
      );
    }

    try {
      const updateData = {
        frozen: frozen || false,
        freezeReason: reason || null,
        lastModified: admin.firestore.FieldValue.serverTimestamp(),
        modifiedBy: context.auth.uid
      };

      // Update Firestore
      await db.collection('users').doc(userId).update(updateData);

      // Update Realtime Database
      await rtdb.ref(`users/${userId}`).update({
        frozen: frozen || false,
        freezeReason: reason || null,
        lastModified: admin.database.ServerValue.TIMESTAMP
      });

      // Log activity
      await db.collection('activityLogs').add({
        adminId: context.auth.uid,
        adminUsername: adminDoc.data().username,
        action: frozen ? 'freeze_account' : 'unfreeze_account',
        userId: userId,
        reason: reason,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: `User ${userId} ${frozen ? 'frozen' : 'unfrozen'} successfully`
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        'internal',
        `Failed to freeze account: ${error.message}`
      );
    }
  });

/**
 * Get real-time user list for admin dashboard
 */
exports.getUserList = functions
  .region('asia-east2')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    const adminDoc = await db
      .collection('admins')
      .doc(context.auth.uid)
      .get();

    if (!adminDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be an admin'
      );
    }

    try {
      const { limit = 50, offset = 0 } = data;

      let query = db.collection('users');
      const snapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(limit + 1)
        .offset(offset)
        .get();

      const users = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        users: users.slice(0, limit),
        hasMore: users.length > limit,
        count: users.length
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        'internal',
        `Failed to get user list: ${error.message}`
      );
    }
  });

/**
 * Sync user data to real-time database
 * Triggered when user created in Firestore
 */
exports.syncUserToRTDB = functions
  .region('asia-east2')
  .firestore.document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;

    if (!change.after.exists) {
      // User deleted from Firestore, delete from RTDB
      await rtdb.ref(`users/${userId}`).remove();
      return;
    }

    const userData = change.after.data();

    // Sync to real-time database
    await rtdb.ref(`users/${userId}`).update({
      wallet: userData.wallet || null,
      status: userData.status || 'active',
      frozen: userData.frozen || false,
      vipLevel: userData.vipLevel || 0,
      balance: userData.balance || 0,
      lastModified: admin.database.ServerValue.TIMESTAMP
    });

    return null;
  });

/**
 * Listen to real-time database changes and update Firestore
 */
exports.syncRTDBToFirestore = functions
  .region('asia-east2')
  .database.ref('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const newValue = change.after.val();

    if (!newValue) {
      return null;
    }

    // Sync RTDB changes to Firestore
    await db.collection('users').doc(userId).update({
      status: newValue.status || 'active',
      frozen: newValue.frozen || false,
      syncedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return null;
  });

/**
 * Master control: Bulk update user status
 */
exports.bulkUpdateUserStatus = functions
  .region('asia-east2')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    const adminDoc = await db
      .collection('admins')
      .doc(context.auth.uid)
      .get();

    if (!adminDoc.exists || adminDoc.data().role !== 'master') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only master can perform bulk updates'
      );
    }

    const { userIds, status, reason } = data;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'userIds must be a non-empty array'
      );
    }

    try {
      let updatedCount = 0;

      // Update in batches (max 500 per batch)
      for (let i = 0; i < userIds.length; i += 500) {
        const batch = db.batch();
        const batch_rtdb = rtdb.ref();

        const batchIds = userIds.slice(i, i + 500);

        for (const userId of batchIds) {
          const userRef = db.collection('users').doc(userId);
          batch.update(userRef, {
            status: status || 'active',
            bulkUpdateReason: reason,
            lastModified: admin.firestore.FieldValue.serverTimestamp(),
            modifiedBy: context.auth.uid
          });

          // Also update RTDB
          await rtdb.ref(`users/${userId}`).update({
            status: status || 'active',
            lastModified: admin.database.ServerValue.TIMESTAMP
          });

          updatedCount++;
        }

        await batch.commit();
      }

      // Log activity
      await db.collection('activityLogs').add({
        adminId: context.auth.uid,
        adminUsername: adminDoc.data().username,
        action: 'bulk_update_user_status',
        updatedCount: updatedCount,
        status: status,
        reason: reason,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: `Updated ${updatedCount} users`,
        updatedCount: updatedCount
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        'internal',
        `Failed to bulk update: ${error.message}`
      );
    }
  });

/**
 * Clean up deleted users from real-time database
 * Runs daily
 */
exports.cleanupDeletedUsers = functions
  .region('asia-east2')
  .pubsub.schedule('0 3 * * *')
  .timeZone('Asia/Hong_Kong')
  .onRun(async () => {
    try {
      // Get all users from Firestore
      const firestoreUsers = await db.collection('users').get();
      const firestoreIds = new Set();
      firestoreUsers.forEach(doc => {
        firestoreIds.add(doc.id);
      });

      // Get all users from Realtime Database
      const rtdbSnapshot = await rtdb.ref('users').once('value');
      const rtdbUsers = rtdbSnapshot.val() || {};

      // Remove users from RTDB that don't exist in Firestore
      let deletedCount = 0;
      for (const userId in rtdbUsers) {
        if (!firestoreIds.has(userId)) {
          await rtdb.ref(`users/${userId}`).remove();
          deletedCount++;
        }
      }

      console.log(`Cleanup: Removed ${deletedCount} orphaned users from RTDB`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * User deletion trigger - clean all data
 */
exports.cleanupUserDataOnDelete = functions
  .region('asia-east2')
  .auth.user().onDelete(async (user) => {
    const userId = user.uid;

    try {
      // Delete from Firestore
      const collections = [
        'users',
        'userProfiles',
        'userActivity',
        'userWallets',
        'notifications',
        'trades',
        'deposits',
        'withdrawals'
      ];

      for (const collectionName of collections) {
        const doc = await db.collection(collectionName).doc(userId).get();
        if (doc.exists) {
          await doc.ref.delete();
        }
      }

      // Delete from Realtime Database
      await rtdb.ref(`users/${userId}`).remove();

      console.log(`Cleaned up all data for deleted user: ${userId}`);
      return { success: true, userId };
    } catch (error) {
      console.error('Deletion cleanup error:', error);
      return { success: false, error: error.message };
    }
  });
