#!/bin/bash
# Secure master account setup with password generation

echo "🔐 Secure Master Account Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found"
    echo "Install: npm install -g firebase-tools"
    exit 1
fi

echo ""
echo "Master Account Details:"
echo "  Email: master@onchainweb.site"
echo "  Username: master"
echo ""

# Generate secure password
echo "Generating secure password..."
PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-16)M@ster$(date +%Y)!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Generated Password:"
echo "  $PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  SAVE THIS PASSWORD NOW!"
echo ""
read -p "Saved? (y/N): " saved

if [[ ! "$saved" =~ ^[Yy]$ ]]; then
    echo "❌ Please save the password first"
    exit 1
fi

# Save to temporary secure file
cat > /tmp/master-credentials-$(date +%s).txt << EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SNIPE MASTER ACCOUNT CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain:   https://onchainweb.site
Email:    master@onchainweb.site
Username: master
Password: $PASSWORD

Created:  $(date)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ DELETE THIS FILE AFTER SAVING TO PASSWORD MANAGER
EOF

echo "✅ Credentials saved to: /tmp/master-credentials-*.txt"
echo ""
echo "Next steps:"
echo "1. Create account in Firebase Console:"
echo "   https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users"
echo ""
echo "2. Click 'Add user'"
echo "3. Email: master@onchainweb.site"
echo "4. Password: $PASSWORD"
echo "5. Click 'Add user'"
echo ""
echo "6. OR visit: https://onchainweb.site/master-admin"
echo "   and create account there"
