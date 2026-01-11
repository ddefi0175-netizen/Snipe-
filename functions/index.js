const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Build allowlist from env/config with safe defaults
function getAllowlist() {
  const configList = functions.config().admin?.allowlist || '';
  const envList = process.env.MASTER_ALLOWLIST || '';
  const hardcoded = ['master@gmail.com', 'admin@gmail.com'];
  const merged = [...hardcoded, ...configList.split(','), ...envList.split(',')]
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(merged));
}

function ensureCallerAllowed(context) {
  if (!context.auth || !context.auth.token?.email) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const callerEmail = context.auth.token.email.toLowerCase();
  const allowlist = getAllowlist();
  if (!allowlist.includes(callerEmail)) {
    throw new functions.https.HttpsError('permission-denied', 'Caller not in allowlist');
  }
  return callerEmail;
}

exports.createAdminAccount = functions.https.onCall(async (data, context) => {
  const callerEmail = ensureCallerAllowed(context);

  const email = (data?.email || '').trim().toLowerCase();
  const password = (data?.password || '').trim();
  const role = (data?.role || 'admin').toLowerCase();
  const permissions = data?.permissions || [];

  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and password are required');
  }

  if (password.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 6 characters');
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false
    });

    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role, admin: true });

    // Store admin metadata in Firestore
    await db.collection('admins').doc(userRecord.uid).set({
      email,
      role,
      permissions,
      createdBy: callerEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    }, { merge: true });

    return {
      success: true,
      uid: userRecord.uid,
      email,
      role,
      permissions
    };
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Email already exists');
    }
    console.error('createAdminAccount error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to create admin');
  }
});

exports.resetAdminPassword = functions.https.onCall(async (data, context) => {
  ensureCallerAllowed(context);

  const email = (data?.email || '').trim().toLowerCase();
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: data?.continueUrl || 'https://onchainweb.app/admin'
    });

    return {
      success: true,
      resetLink: link
    };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    console.error('resetAdminPassword error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to reset password');
  }
});
