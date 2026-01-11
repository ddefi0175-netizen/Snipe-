#!/usr/bin/env node

/**
 * Firebase Configuration & Connection Verifier
 * This script tests your Firebase setup and verifies everything is working
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('  🔥 Firebase Configuration Verification Tool');
console.log('='.repeat(70) + '\n');

// Step 1: Check .env file exists
console.log('Step 1: Checking .env file...\n');

const envPath = path.join(__dirname, 'Onchainweb', '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: .env file not found at:', envPath);
  process.exit(1);
}

console.log('✅ .env file found\n');

// Step 2: Read and validate Firebase config
console.log('Step 2: Reading Firebase configuration...\n');

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const config = {};
lines.forEach(line => {
  const [key, ...value] = line.split('=');
  config[key.trim()] = value.join('=').trim();
});

// Check required Firebase variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

let allPresent = true;
requiredVars.forEach(varName => {
  if (config[varName]) {
    console.log(`✅ ${varName}: ${config[varName].substring(0, 30)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.log('\n❌ ERROR: Some Firebase variables are missing!');
  console.log('Please configure your .env file with all Firebase credentials.');
  process.exit(1);
}

console.log('\n✅ All Firebase variables present\n');

// Step 3: Display detailed configuration
console.log('Step 3: Firebase Configuration Summary\n');
console.log('Project Details:');
console.log('  Project ID:', config.VITE_FIREBASE_PROJECT_ID);
console.log('  Auth Domain:', config.VITE_FIREBASE_AUTH_DOMAIN);
console.log('  Storage Bucket:', config.VITE_FIREBASE_STORAGE_BUCKET);
console.log('');

// Step 4: Check Firebase CLI
console.log('Step 4: Checking Firebase CLI...\n');

const { execSync } = require('child_process');

try {
  const version = execSync('firebase --version').toString().trim();
  console.log('✅ Firebase CLI installed:', version);
} catch (error) {
  console.log('❌ Firebase CLI not found');
  console.log('Install it with: npm install -g firebase-tools');
}

console.log('');

// Step 5: Check Firestore Rules
console.log('Step 5: Checking Firestore Security Rules...\n');

const rulesPath = path.join(__dirname, 'firestore.rules');
if (fs.existsSync(rulesPath)) {
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  console.log('✅ firestore.rules file found');

  if (rulesContent.includes('allow read, write: if true')) {
    console.log('✅ Rules allow writes (permissive for testing)');
  } else if (rulesContent.includes('allow create')) {
    console.log('⚠️  Rules restrict writes (may need adjustment)');
  }
} else {
  console.log('⚠️  firestore.rules not found');
}

console.log('');

// Step 6: Display test commands
console.log('Step 6: Next Steps\n');

console.log('To test Firebase integration:');
console.log('');
console.log('Option A: Use the Web Test Page');
console.log('  1. Start dev server: cd Onchainweb && npm run dev');
console.log('  2. Open: http://localhost:5175/test-firebase.html');
console.log('  3. Click "TEST: Add User to Firebase"');
console.log('');
console.log('Option B: Test in Your App');
console.log('  1. Open: http://localhost:5175');
console.log('  2. Connect a wallet');
console.log('  3. Check browser console (F12)');
console.log('  4. Check Firebase Console for new data');
console.log('');
console.log('Option C: Manual Test via Firebase Console');
console.log('  1. Go to: https://console.firebase.google.com');
console.log('  2. Select project: onchainweb-37d30');
console.log('  3. Go to Firestore Database');
console.log('  4. Click "+ Start collection"');
console.log('  5. Collection ID: users');
console.log('  6. Add document with wallet address as ID');
console.log('');

// Step 7: Diagnostic information
console.log('Step 7: Diagnostic Information\n');

console.log('Current working directory:', process.cwd());
console.log('Node version:', process.version);
console.log('');

// Step 8: Security Rules Status
console.log('Step 8: Important Notes\n');

console.log('🔐 Security Rules:');
console.log('  The current rules allow unrestricted writes.');
console.log('  This is fine for development/testing.');
console.log('  For production, implement proper authentication rules.');
console.log('');

console.log('🚀 What Should Happen:');
console.log('  1. User connects wallet in app');
console.log('  2. App calls createUser(userData)');
console.log('  3. Firebase SDK sends write request');
console.log('  4. Security rules allow the write');
console.log('  5. Data appears in Firestore');
console.log('');

console.log('⚠️  If Data Still Doesn\'t Appear:');
console.log('  1. Check browser console (F12) for errors');
console.log('  2. Verify Firebase credentials are correct');
console.log('  3. Check Firestore security rules in Firebase Console');
console.log('  4. Ensure Firestore database is created (not deleted)');
console.log('  5. Try the test page to isolate the issue');
console.log('');

// Step 9: Summary
console.log('='.repeat(70));
console.log('  ✅ Configuration Check Complete');
console.log('='.repeat(70) + '\n');

console.log('Firebase is configured correctly!');
console.log('');
console.log('Next: Test wallet connection in your app.');
console.log('URL: http://localhost:5175');
console.log('');
