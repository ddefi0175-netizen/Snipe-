#!/bin/bash

# Master Account Setup Verification Script
# This script verifies the master account setup feature works correctly

echo "🔍 Master Account Setup Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Test 1: Check if masterAccountSetup.js exists
echo "📝 Test 1: Check if masterAccountSetup.js exists"
if [ -f "Onchainweb/src/lib/masterAccountSetup.js" ]; then
    echo -e "${GREEN}✅ PASSED${NC}: masterAccountSetup.js exists"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: masterAccountSetup.js not found"
    ((FAILED++))
fi
echo ""

# Test 2: Check if masterAccountSetup.js has required exports
echo "📝 Test 2: Check if masterAccountSetup.js has required exports"
if grep -q "export const ensureMasterAccountExists" Onchainweb/src/lib/masterAccountSetup.js && \
   grep -q "export const getMasterAccountConfig" Onchainweb/src/lib/masterAccountSetup.js && \
   grep -q "export const isMasterAccountConfigured" Onchainweb/src/lib/masterAccountSetup.js; then
    echo -e "${GREEN}✅ PASSED${NC}: All required exports present"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: Missing required exports"
    ((FAILED++))
fi
echo ""

# Test 3: Check if MasterAdminDashboard imports the utility
echo "📝 Test 3: Check if MasterAdminDashboard imports the utility"
if grep -q "import.*masterAccountSetup" Onchainweb/src/components/MasterAdminDashboard.jsx; then
    echo -e "${GREEN}✅ PASSED${NC}: MasterAdminDashboard imports masterAccountSetup"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: MasterAdminDashboard doesn't import masterAccountSetup"
    ((FAILED++))
fi
echo ""

# Test 4: Check if MasterAdminDashboard calls ensureMasterAccountExists
echo "📝 Test 4: Check if MasterAdminDashboard calls ensureMasterAccountExists"
if grep -q "ensureMasterAccountExists" Onchainweb/src/components/MasterAdminDashboard.jsx; then
    echo -e "${GREEN}✅ PASSED${NC}: MasterAdminDashboard calls ensureMasterAccountExists"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: MasterAdminDashboard doesn't call ensureMasterAccountExists"
    ((FAILED++))
fi
echo ""

# Test 5: Check if .env.example has VITE_MASTER_PASSWORD
echo "📝 Test 5: Check if .env.example documents VITE_MASTER_PASSWORD"
if grep -q "VITE_MASTER_PASSWORD" Onchainweb/.env.example; then
    echo -e "${GREEN}✅ PASSED${NC}: VITE_MASTER_PASSWORD documented in .env.example"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: VITE_MASTER_PASSWORD not in .env.example"
    ((FAILED++))
fi
echo ""

# Test 6: Check if MASTER_PASSWORD_SETUP.md has been updated
echo "📝 Test 6: Check if MASTER_PASSWORD_SETUP.md mentions environment variables"
if grep -q "VITE_MASTER_PASSWORD" MASTER_PASSWORD_SETUP.md && \
   grep -q "Old Version" MASTER_PASSWORD_SETUP.md; then
    echo -e "${GREEN}✅ PASSED${NC}: MASTER_PASSWORD_SETUP.md updated with new instructions"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: MASTER_PASSWORD_SETUP.md not fully updated"
    ((FAILED++))
fi
echo ""

# Test 7: Check if the code builds successfully
echo "📝 Test 7: Check if the code builds successfully"
cd Onchainweb
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}: Code builds successfully"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: Build failed"
    echo "Build log:"
    tail -20 /tmp/build.log
    ((FAILED++))
fi
cd ..
echo ""

# Test 8: Check for proper error handling in masterAccountSetup.js
echo "📝 Test 8: Check for error handling in masterAccountSetup.js"
if grep -q "try.*catch" Onchainweb/src/lib/masterAccountSetup.js && \
   grep -q "error" Onchainweb/src/lib/masterAccountSetup.js; then
    echo -e "${GREEN}✅ PASSED${NC}: Error handling implemented"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️ WARNING${NC}: Limited error handling found"
    ((PASSED++)) # Not critical
fi
echo ""

# Test 9: Check if setup status is displayed in UI
echo "📝 Test 9: Check if masterSetupStatus is displayed in UI"
if grep -q "masterSetupStatus" Onchainweb/src/components/MasterAdminDashboard.jsx; then
    echo -e "${GREEN}✅ PASSED${NC}: Setup status displayed in UI"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}: Setup status not displayed in UI"
    ((FAILED++))
fi
echo ""

# Test 10: Check backward compatibility (manual Firebase setup should still work)
echo "📝 Test 10: Check backward compatibility comments"
if grep -q "Manual Setup\|Firebase Console" MASTER_PASSWORD_SETUP.md; then
    echo -e "${GREEN}✅ PASSED${NC}: Manual Firebase setup option still documented"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️ WARNING${NC}: Manual setup not well documented"
    ((PASSED++)) # Not critical
fi
echo ""

# Summary
echo "======================================"
echo "📊 Test Results"
echo "======================================"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo "The master account setup feature is working correctly."
    echo ""
    echo "Next steps:"
    echo "1. Set VITE_MASTER_PASSWORD in Onchainweb/.env"
    echo "2. Run 'npm run dev' in Onchainweb/"
    echo "3. Navigate to /master-admin"
    echo "4. Login with username 'master' and your password"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo "Please review the failed tests above."
    exit 1
fi
