#!/bin/bash

# Complete Admin Setup Script for Firebase Authentication
# This script helps you set up admin accounts with proper email addresses

clear

echo "═══════════════════════════════════════════════════════════════════════"
echo "  🔧 Complete Admin Account Setup for Snipe Platform"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "This script will help you:"
echo "  1. Create admin accounts in Firebase with VALID email addresses"
echo "  2. Configure your .env file with the correct allowlist"
echo "  3. Test the login to verify everything works"
echo ""
echo "⚠️  IMPORTANT: Firebase requires REAL email addresses!"
echo "   ❌ master@admin.onchainweb.app (REJECTED by Firebase)"
echo "   ✅ master@gmail.com (ACCEPTED)"
echo ""

read -p "Press Enter to continue..."
clear

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Step 1: Choose Your Email Format"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "You need to choose real email addresses for your admin accounts."
echo ""
echo "Option 1: Gmail (Recommended - Easy)"
echo "  Examples: master@gmail.com, admin@gmail.com"
echo ""
echo "Option 2: Your Own Domain"
echo "  Examples: master@yourdomain.com, admin@yourdomain.com"
echo ""
echo "Option 3: Firebase Auth Domain"
echo "  Examples: master@YOUR_FIREBASE_PROJECT_ID.firebaseapp.com"
echo ""

read -p "Which option do you prefer? (1/2/3): " OPTION

case $OPTION in
  1)
    echo ""
    echo "📧 Using Gmail format"
    echo ""
    read -p "Enter master email (e.g., master@gmail.com): " MASTER_EMAIL
    read -p "Enter admin email (e.g., admin@gmail.com): " ADMIN_EMAIL
    ;;
  2)
    echo ""
    echo "🌐 Using your own domain"
    echo ""
    read -p "Enter your domain (e.g., yourdomain.com): " DOMAIN
    MASTER_EMAIL="master@$DOMAIN"
    ADMIN_EMAIL="admin@$DOMAIN"
    echo "Master email: $MASTER_EMAIL"
    echo "Admin email: $ADMIN_EMAIL"
    ;;
  3)
    echo ""
    echo "🔥 Using Firebase domain"
    echo ""
    MASTER_EMAIL="master@YOUR_FIREBASE_PROJECT_ID.firebaseapp.com"
    ADMIN_EMAIL="admin@YOUR_FIREBASE_PROJECT_ID.firebaseapp.com"
    echo "Master email: $MASTER_EMAIL"
    echo "Admin email: $ADMIN_EMAIL"
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac

echo ""
read -p "Press Enter to continue to Firebase Console..."
clear

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Step 2: Create Admin Accounts in Firebase"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Opening Firebase Console..."
echo ""
echo "URL: https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users"
echo ""

# Try to open the URL in browser
if command -v xdg-open > /dev/null; then
    xdg-open "https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users" 2>/dev/null &
elif command -v open > /dev/null; then
    open "https://console.firebase.google.com/u/0/project/YOUR_FIREBASE_PROJECT_ID/authentication/users" 2>/dev/null &
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Create Master Account"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Click 'Add user' button"
echo "2. Enter these details:"
echo ""
echo "   📧 Email: $MASTER_EMAIL"
echo "   🔑 Password: [Choose a STRONG password]"
echo ""
echo "   ⚠️  Write down this password! You'll need it to login."
echo ""
echo "3. Click 'Add user'"
echo ""

read -p "Press Enter after creating master account..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Create Admin Account (Optional but Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Click 'Add user' button again"
echo "2. Enter these details:"
echo ""
echo "   📧 Email: $ADMIN_EMAIL"
echo "   🔑 Password: [Choose a STRONG password]"
echo ""
echo "3. Click 'Add user'"
echo ""

read -p "Press Enter after creating admin account (or skip if not needed)..."
clear

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Step 3: Update .env Configuration"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "Updating your .env file with the admin allowlist..."
echo ""

# Update .env file
ENV_FILE="/workspaces/Snipe-/Onchainweb/.env"

if [ -f "$ENV_FILE" ]; then
    # Create backup
    cp "$ENV_FILE" "$ENV_FILE.backup"

    # Update or add VITE_ADMIN_ALLOWLIST
    if grep -q "VITE_ADMIN_ALLOWLIST" "$ENV_FILE"; then
        sed -i "s|VITE_ADMIN_ALLOWLIST=.*|VITE_ADMIN_ALLOWLIST=$MASTER_EMAIL,$ADMIN_EMAIL|" "$ENV_FILE"
        echo "✅ Updated VITE_ADMIN_ALLOWLIST in .env"
    else
        echo "VITE_ADMIN_ALLOWLIST=$MASTER_EMAIL,$ADMIN_EMAIL" >> "$ENV_FILE"
        echo "✅ Added VITE_ADMIN_ALLOWLIST to .env"
    fi

    echo ""
    echo "Current allowlist:"
    echo "  $MASTER_EMAIL"
    echo "  $ADMIN_EMAIL"
    echo ""
    echo "✅ .env file updated successfully!"
    echo "   (Backup saved as .env.backup)"
else
    echo "❌ Error: .env file not found at $ENV_FILE"
    echo ""
    echo "Please create it manually with:"
    echo "VITE_ADMIN_ALLOWLIST=$MASTER_EMAIL,$ADMIN_EMAIL"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."
clear

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Step 4: Restart Development Server"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "The dev server needs to restart to load the new configuration."
echo ""

# Check if dev server is running
if pgrep -f "vite" > /dev/null; then
    echo "🔄 Stopping current dev server..."
    pkill -f "vite"
    sleep 2
fi

echo "🚀 Starting dev server..."
cd /workspaces/Snipe-/Onchainweb

# Start dev server in background
npm run dev > /tmp/snipe-dev.log 2>&1 &
DEV_PID=$!

echo "   Dev server starting... (PID: $DEV_PID)"
echo "   Waiting for server to be ready..."

# Wait for server to start
sleep 5

if ps -p $DEV_PID > /dev/null; then
    echo "✅ Dev server is running!"
else
    echo "❌ Dev server failed to start"
    echo "Check logs: tail -f /tmp/snipe-dev.log"
fi

echo ""
read -p "Press Enter to continue to testing..."
clear

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Step 5: Test Your Admin Login"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Setup Complete! Now let's test the login."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Master Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URL: http://localhost:5173/master-admin"
echo ""
echo "📧 Email: $MASTER_EMAIL"
echo "🔑 Password: [the password you created in Firebase]"
echo ""
echo "💡 TIP: Use the FULL EMAIL ADDRESS to login"
echo ""

if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:5173/master-admin" 2>/dev/null &
elif command -v open > /dev/null; then
    open "http://localhost:5173/master-admin" 2>/dev/null &
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Admin Dashboard (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URL: http://localhost:5173/admin"
echo ""
echo "📧 Email: $ADMIN_EMAIL"
echo "🔑 Password: [the password you created in Firebase]"
echo ""
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "✅ All Done! Try logging in now."
echo ""
echo "📖 If you still have issues, check:"
echo "   - FIX_ADMIN_LOGIN_ERROR.md (detailed troubleshooting)"
echo "   - Browser console (F12) for error messages"
echo "   - Dev server logs: tail -f /tmp/snipe-dev.log"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
