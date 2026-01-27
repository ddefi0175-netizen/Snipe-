#!/bin/bash
# Automated environment setup and validation

set -e

echo "🔧 Snipe - Environment Setup Wizard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .env exists
if [ -f "Onchainweb/.env" ]; then
    echo "✅ .env file exists"
    read -p "Reconfigure? (y/N): " reconfigure
    if [[ ! "$reconfigure" =~ ^[Yy]$ ]]; then
        ./validate-config.sh
        exit 0
    fi
fi

# Run Firebase credentials setup
./setup-firebase-credentials.sh

# Validate configuration
./validate-config.sh

echo ""
echo "✅ Environment setup complete!"
echo "Next: firebase deploy --only firestore:rules"
