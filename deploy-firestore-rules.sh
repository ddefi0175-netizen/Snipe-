#!/bin/bash
# Deploy Firestore rules with confirmation

set -e

./validate-firestore-rules.sh

echo ""
echo "🚀 Deploy Firestore Rules"
echo "━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: $(grep '"default"' .firebaserc | grep -oP '"\K[^"]+')"
echo ""

read -p "Deploy to production? (y/N): " confirm
if [[ $confirm == [yY] ]]; then
    firebase deploy --only firestore:rules
    echo "✅ Firestore rules deployed successfully"
else
    echo "❌ Deployment cancelled"
    exit 1
fi
