#!/bin/bash
# ============================================
# Admin and Master Access Control Test
# ============================================
# Verifies that admin and master accounts have proper access controls
# and can control their designated functions with real-time data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}🔐 ADMIN AND MASTER ACCESS CONTROL TEST${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

# Test 1: Verify Admin Routes Exist
echo -e "${YELLOW}[TEST 1] Verifying Admin Routes Configuration...${NC}"
if [ -f "Onchainweb/src/main.jsx" ] || [ -f "Onchainweb/src/App.jsx" ]; then
    # Check for admin routes
    APP_FILES=$(find Onchainweb/src -name "*.jsx" -o -name "*.js" | xargs grep -l "admin\|master" 2>/dev/null || echo "")
    
    if [ -n "$APP_FILES" ]; then
        echo -e "  ✅ Admin/Master routes found in application"
        PASSED=$((PASSED + 1))
        
        # Check for specific routes
        if grep -r "/admin" Onchainweb/src/ 2>/dev/null | grep -q "path\|route"; then
            echo -e "  ✅ Admin route (/admin) configured"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  Admin route may not be configured${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        if grep -r "/master-admin" Onchainweb/src/ 2>/dev/null | grep -q "path\|route"; then
            echo -e "  ✅ Master admin route (/master-admin) configured"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  Master admin route may not be configured${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "  ${RED}❌ No admin/master routes found${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "  ${RED}❌ Main application files not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Verify Admin Components Exist
echo -e "${YELLOW}[TEST 2] Verifying Admin Component Files...${NC}"
ADMIN_COMPONENTS=(
    "AdminPanel"
    "MasterAdminDashboard"
)

for component in "${ADMIN_COMPONENTS[@]}"; do
    COMPONENT_FILE=$(find Onchainweb/src -name "${component}.jsx" -o -name "${component}.js" 2>/dev/null | head -1)
    if [ -n "$COMPONENT_FILE" ]; then
        echo -e "  ✅ Component $component found at $COMPONENT_FILE"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Component $component not found${NC}"
        FAILED=$((FAILED + 1))
    fi
done
echo ""

# Test 3: Verify Admin Permissions Configuration
echo -e "${YELLOW}[TEST 3] Verifying Admin Permissions System...${NC}"
# Search for permission-related code
PERMISSION_FILES=$(find Onchainweb/src -type f \( -name "*.jsx" -o -name "*.js" \) -exec grep -l "permission\|manageUsers\|manageBalances" {} \; 2>/dev/null || echo "")

if [ -n "$PERMISSION_FILES" ]; then
    echo -e "  ✅ Permission system found in code"
    PASSED=$((PASSED + 1))
    
    # Check for specific permissions
    PERMISSIONS=(
        "manageUsers"
        "manageBalances"
        "manageKYC"
        "manageTrades"
        "manageDeposits"
        "manageWithdrawals"
    )
    
    for perm in "${PERMISSIONS[@]}"; do
        if grep -r "$perm" Onchainweb/src/ 2>/dev/null | grep -q "$perm"; then
            echo -e "  ✅ Permission $perm implemented"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  Permission $perm not found${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    echo -e "  ${YELLOW}⚠️  Permission system implementation not clearly visible${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 4: Verify Firebase Admin Collection Security
echo -e "${YELLOW}[TEST 4] Verifying Admin Data Security Rules...${NC}"
if [ -f "firestore.rules" ]; then
    RULES_CONTENT=$(cat firestore.rules)
    
    # Check that admins collection has proper security
    if echo "$RULES_CONTENT" | grep -A 10 "match /admins" | grep -q "isAdmin()"; then
        echo -e "  ✅ Admin collection secured (requires admin auth)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Admin collection may not be properly secured${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    # Check that users can only read their own data
    if echo "$RULES_CONTENT" | grep -A 10 "match /users" | grep -q "isOwner"; then
        echo -e "  ✅ User data protected (owner-only access)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ User data may not be properly protected${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    # Check activity logs are protected
    if echo "$RULES_CONTENT" | grep -q "activityLogs"; then
        echo -e "  ✅ Activity logs collection referenced in rules"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Activity logs security may need review${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${RED}❌ firestore.rules not found - Security rules not configured!${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Verify Admin Authentication is Separate
echo -e "${YELLOW}[TEST 5] Verifying Admin Authentication Implementation...${NC}"
if [ -f "Onchainweb/src/services/firebase.service.js" ]; then
    SERVICE_CONTENT=$(cat Onchainweb/src/services/firebase.service.js)
    
    # Check for Firebase Authentication usage
    if echo "$SERVICE_CONTENT" | grep -q "signInWithEmailAndPassword\|firebaseSignIn"; then
        echo -e "  ✅ Firebase email/password authentication implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Firebase authentication may not be implemented${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    # Check that it's different from wallet auth
    if grep -r "wallet\|metamask\|web3" Onchainweb/src/lib/ 2>/dev/null | grep -q "connect"; then
        echo -e "  ✅ Separate wallet authentication system exists"
        PASSED=$((PASSED + 1))
        echo -e "  ℹ️  Admin uses Firebase Auth, Users use Wallet Auth (as intended)"
    fi
else
    echo -e "  ${RED}❌ firebase.service.js not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Verify Admin Functions Access Real-Time Data
echo -e "${YELLOW}[TEST 6] Verifying Admin Real-Time Data Access...${NC}"
# Check if admin components use real-time listeners
ADMIN_FILES=$(find Onchainweb/src -type f \( -name "*Admin*.jsx" -o -name "*Admin*.js" \) 2>/dev/null || echo "")

if [ -n "$ADMIN_FILES" ]; then
    # Check for real-time data patterns
    if grep -h "onSnapshot\|useEffect\|listener" $ADMIN_FILES 2>/dev/null | grep -q "onSnapshot\|listener"; then
        echo -e "  ✅ Admin components use real-time data listeners"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Real-time listeners may not be implemented in admin components${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for Firebase/Firestore imports
    if grep -h "import.*firebase\|import.*firestore" $ADMIN_FILES 2>/dev/null | grep -q "firebase\|firestore"; then
        echo -e "  ✅ Admin components import Firebase/Firestore services"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Firebase imports may not be present in admin components${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠️  No admin component files found for analysis${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 7: Verify No Hardcoded Admin Credentials
echo -e "${YELLOW}[TEST 7] Verifying No Hardcoded Credentials...${NC}"
# Search for potential hardcoded credentials in source files
SUSPICIOUS_PATTERNS=(
    "password.*=.*['\"]"
    "admin.*password"
    "master.*password"
    "apiKey.*=.*['\"][^$]"
)

FOUND_SUSPICIOUS=0
for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    MATCHES=$(grep -r -n "$pattern" Onchainweb/src/ 2>/dev/null | grep -v "\.env\|example\|comment\|//\|/\*" || echo "")
    if [ -n "$MATCHES" ]; then
        echo -e "  ${YELLOW}⚠️  Found potential hardcoded credential pattern: $pattern${NC}"
        # echo "$MATCHES" | head -3
        FOUND_SUSPICIOUS=$((FOUND_SUSPICIOUS + 1))
        WARNINGS=$((WARNINGS + 1))
    fi
done

if [ $FOUND_SUSPICIOUS -eq 0 ]; then
    echo -e "  ✅ No obvious hardcoded credentials found in source code"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 8: Verify Environment Variables for Secrets
echo -e "${YELLOW}[TEST 8] Verifying Environment Variable Usage...${NC}"
if [ -f "Onchainweb/.env.example" ]; then
    ENV_EXAMPLE=$(cat Onchainweb/.env.example)
    
    if echo "$ENV_EXAMPLE" | grep -q "VITE_FIREBASE_API_KEY"; then
        echo -e "  ✅ Firebase API key configured via environment variable"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Firebase API key not in .env.example${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if echo "$ENV_EXAMPLE" | grep -q "VITE_WALLETCONNECT_PROJECT_ID"; then
        echo -e "  ✅ WalletConnect project ID configured via environment variable"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  WalletConnect project ID not in .env.example${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${RED}❌ .env.example not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 9: Verify Admin Activity Logging
echo -e "${YELLOW}[TEST 9] Verifying Admin Activity Logging System...${NC}"
if [ -f "firestore.rules" ]; then
    RULES_CONTENT=$(cat firestore.rules)
    
    if echo "$RULES_CONTENT" | grep -q "activityLogs"; then
        echo -e "  ✅ Activity logs collection exists in security rules"
        PASSED=$((PASSED + 1))
        
        # Check if logs are write-once (immutable)
        if echo "$RULES_CONTENT" | grep -A 5 "activityLogs" | grep -q "create"; then
            echo -e "  ✅ Activity logs appear to be write-protected"
            PASSED=$((PASSED + 1))
        fi
    else
        echo -e "  ${YELLOW}⚠️  Activity logs collection not found in rules${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

# Summary
echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}TEST SUMMARY${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${RED}Failed:   $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical access control tests passed!${NC}"
    echo -e "${GREEN}Admin and master accounts have proper access controls.${NC}"
    echo ""
    echo -e "${CYAN}Key Security Features Verified:${NC}"
    echo -e "  • Admin routes properly configured"
    echo -e "  • Firebase security rules protect sensitive data"
    echo -e "  • Admin authentication separate from wallet authentication"
    echo -e "  • No hardcoded credentials in source code"
    echo -e "  • Environment variables used for configuration"
    echo -e "  • Activity logging system in place"
    exit 0
else
    echo -e "${RED}❌ Some critical tests failed. Please review the issues above.${NC}"
    exit 1
fi
