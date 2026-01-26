# ============================================
# ADMIN SYSTEM CONFIGURATION EXAMPLE
# ============================================
# This file shows the minimum configuration needed for the admin system
# Copy relevant sections to your .env file

# ===========================================
# REQUIRED: ENABLE ADMIN FEATURES
# ===========================================
VITE_ENABLE_ADMIN=true

# ===========================================
# REQUIRED: ADMIN ALLOWLIST
# ===========================================
# Comma-separated list of admin emails
# First email starting with 'master@' will be the master account
# Example: master@admin.yourdomain.com,john@admin.yourdomain.com,jane@admin.yourdomain.com
VITE_ADMIN_ALLOWLIST=master@admin.yourdomain.com

# ===========================================
# OPTIONAL: CUSTOMIZE ADMIN ROUTES
# ===========================================
VITE_ADMIN_ROUTE=/admin
VITE_MASTER_ADMIN_ROUTE=/master-admin

# ===========================================
# REQUIRED: FIREBASE CONFIGURATION
# ===========================================
# Get these from Firebase Console → Project Settings → General
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# ===========================================
# SETUP INSTRUCTIONS
# ===========================================
# 1. Replace the Firebase credentials with your actual values
# 2. Set the master email in VITE_ADMIN_ALLOWLIST
# 3. Save this file as .env in the Onchainweb directory
# 4. Run: npm install
# 5. Run: npm run dev
# 6. Navigate to /master-admin to set up master account
# 7. See ADMIN_SYSTEM_SETUP_GUIDE.md for detailed instructions
