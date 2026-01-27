#!/bin/bash
# Secure master account setup script

echo "🔐 Master Account Setup (Secure Method)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  SECURITY NOTICE:"
echo "The password mentioned in chat is compromised."
echo "This script will guide you to create a NEW secure password."
echo ""

# Generate secure password suggestion
SECURE_PASS=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
SECURE_PASS="M@ster${SECURE_PASS}2026!"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Suggested Secure Password:"
echo "  $SECURE_PASS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ This password is:"
echo "   • Not compromised"
echo "   • Strong (18+ characters)"
echo "   • Unique"
echo ""

read -p "Save this password now? (y/N): " confirm

if [[ $confirm == [yY] ]]; then
    echo ""
    echo "Creating credentials file..."
    
    cat > master-credentials-SECURE.txt << EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MASTER ACCOUNT CREDENTIALS
   Domain: onchainweb.site
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email:    master@onchainweb.site
Username: master
Password: $SECURE_PASS

Created:  $(date '+%Y-%m-%d %H:%M:%S')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  SAVE TO PASSWORD MANAGER NOW!
Then DELETE this file: rm master-credentials-SECURE.txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

    echo "✅ Credentials saved to: master-credentials-SECURE.txt"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open file: cat master-credentials-SECURE.txt"
    echo "2. Save to password manager (1Password, Bitwarden, etc.)"
    echo "3. Delete file: rm master-credentials-SECURE.txt"
    echo ""
    
    # Open Firebase Console
    echo "🔥 Opening Firebase Console..."
    echo "Create account at: https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users"
    
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "https://console.firebase.google.com/u/0/project/onchainweb-37d30/authentication/users" 2>/dev/null &
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Firebase Console Instructions:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Click 'Add user' button"
    echo "2. Email: master@onchainweb.site"
    echo "3. Password: [Use password from file]"
    echo "4. Click 'Add user'"
    echo "5. ✅ Done!"
else
    echo "❌ Setup cancelled"
    exit 1
fi
