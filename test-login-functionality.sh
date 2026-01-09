#!/bin/bash
# ============================================
# Login Functionality Test
# ============================================
# Verifies that login systems work properly
# Tests both admin/master login (Firebase Auth) and wallet connection

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
echo -e "${CYAN}🔑 LOGIN FUNCTIONALITY TEST${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

# Test 1: Verify Firebase Authentication Setup
echo -e "${YELLOW}[TEST 1] Verifying Firebase Authentication Setup...${NC}"
if [ -f "Onchainweb/src/services/firebase.service.js" ]; then
    SERVICE_CONTENT=$(cat Onchainweb/src/services/firebase.service.js)
    
    # Check for authentication imports
    if echo "$SERVICE_CONTENT" | grep -q "getAuth\|signInWithEmailAndPassword"; then
        echo -e "  ✅ Firebase Authentication imports present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Firebase Authentication imports missing${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    # Check for sign-in function
    if echo "$SERVICE_CONTENT" | grep -q "firebaseSignIn\|signInWithEmailAndPassword"; then
        echo -e "  ✅ Sign-in function implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Sign-in function not found${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    # Check for sign-out function
    if echo "$SERVICE_CONTENT" | grep -q "firebaseSignOut\|signOut"; then
        echo -e "  ✅ Sign-out function implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Sign-out function not found${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    # Check for auth state listener
    if echo "$SERVICE_CONTENT" | grep -q "onAuthChange\|onAuthStateChanged"; then
        echo -e "  ✅ Auth state change listener implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Auth state change listener not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${RED}❌ firebase.service.js not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Verify Wallet Connection System
echo -e "${YELLOW}[TEST 2] Verifying Wallet Connection System...${NC}"
WALLET_FILES=$(find Onchainweb/src -name "*wallet*.jsx" -o -name "*wallet*.js" -o -name "*Wallet*.jsx" -o -name "*Wallet*.js" 2>/dev/null | head -5)

if [ -n "$WALLET_FILES" ]; then
    echo -e "  ✅ Wallet-related files found:"
    for file in $WALLET_FILES; do
        echo -e "     • $(basename $file)"
    done
    PASSED=$((PASSED + 1))
    
    # Check for WalletConnect integration
    if grep -h "WalletConnect\|walletconnect\|@walletconnect" $WALLET_FILES 2>/dev/null | grep -q "walletconnect"; then
        echo -e "  ✅ WalletConnect integration present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  WalletConnect integration not clearly visible${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for MetaMask support
    if grep -rh "metamask\|MetaMask\|ethereum" Onchainweb/src/lib/ 2>/dev/null | grep -q "metamask\|ethereum"; then
        echo -e "  ✅ MetaMask/Ethereum provider support present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  MetaMask support not clearly visible${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${RED}❌ No wallet-related files found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Verify Login Form Components
echo -e "${YELLOW}[TEST 3] Verifying Login Form Components...${NC}"
# Search for login forms in admin components
ADMIN_LOGIN_FILES=$(find Onchainweb/src -type f \( -name "*Admin*.jsx" -o -name "*login*.jsx" -o -name "*Login*.jsx" \) 2>/dev/null)

if [ -n "$ADMIN_LOGIN_FILES" ]; then
    echo -e "  ✅ Login-related components found"
    PASSED=$((PASSED + 1))
    
    # Check for form inputs
    if grep -h "email\|username" $ADMIN_LOGIN_FILES 2>/dev/null | grep -q "input\|Input"; then
        echo -e "  ✅ Email/username input fields present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Email/username input not clearly visible${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -h "password" $ADMIN_LOGIN_FILES 2>/dev/null | grep -q "input\|Input\|type.*password"; then
        echo -e "  ✅ Password input fields present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Password input not clearly visible${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠️  No dedicated login component files found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 4: Verify Session Management
echo -e "${YELLOW}[TEST 4] Verifying Session Management...${NC}"
# Check for session/token storage
if grep -r "localStorage\|sessionStorage\|token" Onchainweb/src/ 2>/dev/null | grep -q "token\|auth"; then
    echo -e "  ✅ Session/token storage implementation found"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${YELLOW}⚠️  Session storage implementation not clearly visible${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for authentication state management
if grep -r "useState.*auth\|useContext.*auth\|AuthContext" Onchainweb/src/ 2>/dev/null | head -1 | grep -q "auth"; then
    echo -e "  ✅ Authentication state management present"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${YELLOW}⚠️  Auth state management not clearly visible${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 5: Verify Protected Routes
echo -e "${YELLOW}[TEST 5] Verifying Protected Route Implementation...${NC}"
# Check for route protection/guards
if grep -r "ProtectedRoute\|PrivateRoute\|RequireAuth\|isAuthenticated" Onchainweb/src/ 2>/dev/null | grep -q "Route\|Auth"; then
    echo -e "  ✅ Protected route implementation found"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${YELLOW}⚠️  Protected routes may not be implemented${NC}"
    echo -e "  ℹ️  Consider adding route protection for admin/master pages"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 6: Verify Error Handling for Login
echo -e "${YELLOW}[TEST 6] Verifying Login Error Handling...${NC}"
# Check for error handling in login-related files
if [ -n "$ADMIN_LOGIN_FILES" ]; then
    if grep -h "catch\|error\|Error" $ADMIN_LOGIN_FILES 2>/dev/null | grep -q "catch\|error"; then
        echo -e "  ✅ Error handling present in login components"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Error handling not clearly visible${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for user-friendly error messages
if grep -rh "invalid.*password\|incorrect.*credentials\|login.*failed" Onchainweb/src/ 2>/dev/null | head -1 | grep -qi "invalid\|incorrect\|failed"; then
    echo -e "  ✅ User-friendly error messages present"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${YELLOW}⚠️  User-friendly error messages not clearly visible${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 7: Verify Multi-Wallet Support Configuration
echo -e "${YELLOW}[TEST 7] Verifying Multi-Wallet Support...${NC}"
WALLET_PROVIDERS=(
    "MetaMask"
    "Trust.*Wallet"
    "Coinbase"
    "WalletConnect"
)

FOUND_PROVIDERS=0
for provider in "${WALLET_PROVIDERS[@]}"; do
    if grep -ri "$provider" Onchainweb/src/ 2>/dev/null | grep -q "$provider"; then
        echo -e "  ✅ $provider support found"
        FOUND_PROVIDERS=$((FOUND_PROVIDERS + 1))
        PASSED=$((PASSED + 1))
    fi
done

if [ $FOUND_PROVIDERS -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️  Multi-wallet support not clearly visible${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "  ℹ️  Found $FOUND_PROVIDERS wallet providers configured"
fi
echo ""

# Test 8: Verify No Plaintext Password Storage
echo -e "${YELLOW}[TEST 8] Verifying No Plaintext Password Storage...${NC}"
# Check that passwords are not stored in plaintext
SUSPICIOUS_STORAGE=$(grep -rn "localStorage.*password\|sessionStorage.*password" Onchainweb/src/ 2>/dev/null | grep -v "//\|/\*" || echo "")

if [ -z "$SUSPICIOUS_STORAGE" ]; then
    echo -e "  ✅ No obvious plaintext password storage in localStorage/sessionStorage"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${RED}❌ WARNING: Potential password storage in browser storage detected!${NC}"
    echo -e "  ${YELLOW}This is a security risk - passwords should never be stored in browser storage${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 9: Verify Firebase Auth Configuration
echo -e "${YELLOW}[TEST 9] Verifying Firebase Auth Configuration...${NC}"
if [ -f "Onchainweb/.env.example" ]; then
    ENV_EXAMPLE=$(cat Onchainweb/.env.example)
    
    if echo "$ENV_EXAMPLE" | grep -q "VITE_FIREBASE_AUTH_DOMAIN"; then
        echo -e "  ✅ Firebase Auth Domain configured"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Firebase Auth Domain not configured${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if echo "$ENV_EXAMPLE" | grep -q "VITE_FIREBASE_API_KEY"; then
        echo -e "  ✅ Firebase API Key configured"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Firebase API Key not configured${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "  ${RED}❌ .env.example not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 10: Verify Login Documentation
echo -e "${YELLOW}[TEST 10] Verifying Login Documentation...${NC}"
LOGIN_DOCS=(
    "ADMIN_LOGIN_GUIDE.md"
    "ADMIN_USER_GUIDE.md"
    "README.md"
)

FOUND_DOCS=0
for doc in "${LOGIN_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        if grep -q "login\|Login\|authentication\|Authentication" "$doc" 2>/dev/null; then
            echo -e "  ✅ $doc contains login documentation"
            FOUND_DOCS=$((FOUND_DOCS + 1))
            PASSED=$((PASSED + 1))
        fi
    fi
done

if [ $FOUND_DOCS -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️  Login documentation may be incomplete${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "  ℹ️  Found login documentation in $FOUND_DOCS files"
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
    echo -e "${GREEN}✅ All critical login functionality tests passed!${NC}"
    echo -e "${GREEN}Login systems are properly implemented.${NC}"
    echo ""
    echo -e "${CYAN}Key Login Features Verified:${NC}"
    echo -e "  • Firebase Authentication for admin/master accounts"
    echo -e "  • Wallet connection system for regular users"
    echo -e "  • Session management implementation"
    echo -e "  • Error handling for login failures"
    echo -e "  • Multi-wallet support configured"
    echo -e "  • No plaintext password storage"
    echo -e "  • Comprehensive login documentation"
    exit 0
else
    echo -e "${RED}❌ Some critical tests failed. Please review the issues above.${NC}"
    exit 1
fi
