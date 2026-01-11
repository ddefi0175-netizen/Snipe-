#!/usr/bin/env node

/**
 * Admin Account Verification Script
 * Checks if admin accounts exist in Firebase Authentication
 * and provides instructions for creating them if they don't exist
 */

const admin = require('firebase-admin');

// Firebase Admin SDK Configuration
// Get your service account key from:
// Firebase Console > Project Settings > Service Accounts > Generate new private key

console.log('\n🔍 Admin Account Verification Tool\n');
console.log('This script checks if your admin accounts exist in Firebase.\n');

// Check if service account key exists
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('❌ serviceAccountKey.json not found!\n');
  console.log('📋 To use this script, you need to:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your project: onchainweb-37d30');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Save the file as "serviceAccountKey.json" in this directory');
  console.log('6. Run this script again\n');

  console.log('📖 Alternative: Create accounts manually in Firebase Console:');
  console.log('   https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users\n');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Connected to Firebase Admin SDK\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// Admin accounts to check
const adminAccounts = [
  { email: 'master@admin.onchainweb.app', role: 'master' },
  { email: 'admin@admin.onchainweb.app', role: 'admin' }
];

async function checkAdminAccounts() {
  console.log('🔍 Checking admin accounts...\n');

  for (const account of adminAccounts) {
    try {
      const user = await admin.auth().getUserByEmail(account.email);
      console.log(`✅ ${account.role.toUpperCase()} account exists:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Created: ${new Date(user.metadata.creationTime).toLocaleString()}`);
      console.log('');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`❌ ${account.role.toUpperCase()} account NOT FOUND: ${account.email}`);
        console.log(`   You need to create this account in Firebase Console\n`);
      } else {
        console.error(`❌ Error checking ${account.email}:`, error.message);
      }
    }
  }

  console.log('\n📋 Next Steps:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nIf any accounts are missing, create them:');
  console.log('1. Go to: https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users');
  console.log('2. Click "Add user"');
  console.log('3. Enter email and password:');
  console.log('   - Master: master@admin.onchainweb.app');
  console.log('   - Admin: admin@admin.onchainweb.app');
  console.log('4. Click "Add user"');
  console.log('5. Try logging in again\n');
}

checkAdminAccounts()
  .then(() => {
    console.log('✅ Verification complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
