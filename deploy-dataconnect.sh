#!/bin/bash
# Deploy Firebase Data Connect Connectors
# Usage: ./deploy-dataconnect.sh

set -e

echo "🚀 Firebase Data Connect Deployment"
echo "===================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not installed"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list > /dev/null 2>&1; then
    echo "❌ Not logged into Firebase"
    echo "Run: firebase login"
    exit 1
fi

# Get current project
PROJECT_ID=$(firebase projects:list 2>/dev/null | grep -E "^[^[:space:]]+" -o | head -1)
echo "📦 Project: $PROJECT_ID"
echo ""

# Check if dataconnect.yaml exists
if [ ! -f "dataconnect.yaml" ]; then
    echo "❌ dataconnect.yaml not found"
    echo "Create it in the root directory"
    exit 1
fi

# Update dataconnect.yaml with correct project ID
echo "🔧 Updating dataconnect.yaml with project ID..."
sed -i "s/\[PROJECT_ID\]/$PROJECT_ID/g" dataconnect.yaml
cat dataconnect.yaml
echo ""

# Deploy Data Connect connectors
echo "📤 Deploying Data Connect connectors..."
firebase deploy --only dataconnect:connectors

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "1. View in Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID/dataconnect"
echo "2. Test queries: Firebase Console → Data Connect → Explorer"
echo "3. Monitor usage: Metrics tab"
echo ""
echo "📖 Documentation: See FIREBASE_DATA_CONNECT_SETUP.md"
