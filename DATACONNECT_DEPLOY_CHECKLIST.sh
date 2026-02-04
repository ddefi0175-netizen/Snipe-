#!/bin/bash
# Firebase Data Connect Deployment Checklist
# Follow these steps to deploy Firebase Data Connect to your project

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Firebase Data Connect Deployment Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Checklist items
echo "📋 Deployment Checklist:"
echo ""

# 1. Firebase CLI
echo -n "1️⃣  Firebase CLI installed? (y/n): "
read firebase_cli
if [ "$firebase_cli" = "y" ]; then
    echo -e "${GREEN}✓ Firebase CLI ready${NC}"
else
    echo -e "${RED}✗ Install Firebase CLI: npm install -g firebase-tools${NC}"
    exit 1
fi
echo ""

# 2. Firebase Login
echo -n "2️⃣  Logged into Firebase? (y/n): "
read firebase_login
if [ "$firebase_login" = "y" ]; then
    echo -e "${GREEN}✓ Firebase login verified${NC}"
else
    echo -e "${RED}✗ Login with: firebase login${NC}"
    exit 1
fi
echo ""

# 3. Project ID
echo "3️⃣  Update dataconnect.yaml with your project ID"
echo ""
echo "   Get your project ID from Firebase Console:"
echo "   - Go to: https://console.firebase.google.com"
echo "   - Select your project"
echo "   - Settings ⚙️ → Project Settings"
echo "   - Copy the Project ID"
echo ""

# Read project ID
echo -n "   Enter your Firebase Project ID: "
read project_id

if [ -z "$project_id" ]; then
    echo -e "${RED}✗ Project ID required${NC}"
    exit 1
fi

# Update dataconnect.yaml
echo "   Updating dataconnect.yaml..."
sed -i "s/\[PROJECT_ID\]/$project_id/g" dataconnect.yaml
echo -e "${GREEN}✓ dataconnect.yaml updated${NC}"
echo ""

# 4. Verify files
echo "4️⃣  Verifying all files..."
files=(
    "dataconnect.yaml"
    "dataconnect/connectors/users.gql"
    "dataconnect/connectors/trades.gql"
    "dataconnect/connectors/chat.gql"
    "dataconnect/connectors/deposits.gql"
    "dataconnect/connectors/notifications.gql"
    "Onchainweb/src/services/dataconnect.service.ts"
    "Onchainweb/src/types/dataconnect.types.ts"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo -e "   ${RED}✗ $file (missing)${NC}"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo -e "${RED}✗ Some files are missing${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All files present${NC}"
echo ""

# 5. Enable Data Connect
echo "5️⃣  Enabling Data Connect (first time only)"
echo ""
echo "   Firebase Data Connect is available in:"
echo "   - Firebase Console → Data Connect (beta)"
echo ""
echo -n "   Have you enabled Data Connect in Firebase? (y/n): "
read data_connect_enabled
if [ "$data_connect_enabled" != "y" ]; then
    echo -e "${YELLOW}⚠️  Please enable Data Connect in Firebase Console first${NC}"
    echo "   Then run this script again."
    exit 0
fi
echo -e "${GREEN}✓ Data Connect enabled${NC}"
echo ""

# 6. Deploy
echo "6️⃣  Deploying Data Connect connectors..."
echo ""

if firebase deploy --only dataconnect:connectors; then
    echo ""
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Deployment failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "- Check dataconnect.yaml has correct project ID"
    echo "- Ensure Data Connect is enabled in Firebase Console"
    echo "- Review GraphQL syntax in dataconnect/connectors/*.gql"
    exit 1
fi

# 7. Verify deployment
echo "7️⃣  Verifying deployment..."
echo ""
echo "   Go to Firebase Console:"
echo "   → https://console.firebase.google.com/project/$project_id/dataconnect"
echo ""
echo "   Look for:"
echo "   ✓ Your connectors listed (users, trades, chat, etc.)"
echo "   ✓ Green status indicators"
echo "   ✓ Generated SDK available"
echo ""

# 8. Next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Firebase Data Connect is deployed!"
echo ""
echo "📖 Next Steps:"
echo ""
echo "1. Read documentation:"
echo "   - FIREBASE_DATA_CONNECT_SUMMARY.md"
echo "   - FIREBASE_DATA_CONNECT_SETUP.md"
echo ""
echo "2. Test in Firebase Console:"
echo "   - Data Connect → Explorer"
echo "   - Test queries and mutations"
echo ""
echo "3. Use in components:"
echo "   - See examples in: Onchainweb/src/examples/DataConnectExamples.tsx"
echo "   - Import services: import { usersService } from '@/services/dataconnect.service'"
echo ""
echo "4. Add more connectors:"
echo "   - Create .gql files in dataconnect/connectors/"
echo "   - Deploy with: firebase deploy --only dataconnect:connectors"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Useful Commands:"
echo ""
echo "# View connectors status"
echo "firebase dataconnect connectors:list"
echo ""
echo "# View metrics"
echo "firebase dataconnect metrics:view"
echo ""
echo "# Update Firebase Security Rules"
echo "firebase deploy --only firestore:rules"
echo ""
echo "# Full deployment"
echo "npm run build:production && firebase deploy"
echo ""
echo "✨ Happy coding!"
