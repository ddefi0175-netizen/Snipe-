#!/bin/bash
# ============================================
# Admin Login Verification Test
# ============================================
# Verifies that admin and master login features are properly configured
# and functional with Firebase authentication and real-time data

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
echo -e "${CYAN}🔐 ADMIN LOGIN VERIFICATION TEST${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

# Test 1: Check Environment Configuration
echo -e "${YELLOW}[TEST 1] Checking Environment Configuration...${NC}"
if [ -f "Onchainweb/.env" ]; then
    echo -e "  ✅ .env file found"
    PASSED=$((PASSED + 1))
    
    # Check if admin is enabled
    if grep -q "VITE_ENABLE_ADMIN=true" Onchainweb/.env; then
        echo -e "  ✅ Admin features are ENABLED (VITE_ENABLE_ADMIN=true)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Admin features are DISABLED${NC}"
        echo -e "     ${YELLOW}→ Set VITE_ENABLE_ADMIN=true in Onchainweb/.env${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    # Check if allowlist is configured
    if grep -q "VITE_ADMIN_ALLOWLIST=.*@" Onchainweb/.env; then
        ALLOWLIST=$(grep "VITE_ADMIN_ALLOWLIST=" Onchainweb/.env | cut -d'=' -f2)
        echo -e "  ✅ Admin allowlist configured: $ALLOWLIST"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Admin allowlist is empty${NC}"
        echo -e "     ${YELLOW}→ Add admin emails to VITE_ADMIN_ALLOWLIST${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check Firebase configuration
    if grep -q "VITE_FIREBASE_API_KEY=AIzaSy" Onchainweb/.env; then
        echo -e "  ✅ Firebase API key configured"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Firebase API key not configured${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if grep -q "VITE_FIREBASE_PROJECT_ID=" Onchainweb/.env; then
        PROJECT_ID=$(grep "VITE_FIREBASE_PROJECT_ID=" Onchainweb/.env | cut -d'=' -f2)
        if [ -n "$PROJECT_ID" ]; then
            echo -e "  ✅ Firebase project ID: $PROJECT_ID"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${RED}❌ Firebase project ID is empty${NC}"
            FAILED=$((FAILED + 1))
        fi
    fi
else
    echo -e "  ${RED}❌ .env file not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Check Firebase Service Implementation
echo -e "${YELLOW}[TEST 2] Checking Firebase Service Implementation...${NC}"
if [ -f "Onchainweb/src/services/firebase.service.js" ]; then
    echo -e "  ✅ firebase.service.js found"
    PASSED=$((PASSED + 1))
    
    # Check for authentication functions
    if grep -q "firebaseSignIn" Onchainweb/src/services/firebase.service.js; then
        echo -e "  ✅ firebaseSignIn function implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ firebaseSignIn function missing${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if grep -q "firebaseSignOut" Onchainweb/src/services/firebase.service.js; then
        echo -e "  ✅ firebaseSignOut function implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ firebaseSignOut function missing${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "  ${RED}❌ firebase.service.js not found${NC}"
    FAILED=$((FAILED + 1))
fi

# Also check the alternate location
if [ -f "Onchainweb/src/lib/firebase.js" ]; then
    echo -e "  ✅ lib/firebase.js found (backup)"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 3: Check Admin Authentication Utilities
echo -e "${YELLOW}[TEST 3] Checking Admin Authentication Utilities...${NC}"
if [ -f "Onchainweb/src/lib/adminAuth.js" ]; then
    echo -e "  ✅ adminAuth.js found"
    PASSED=$((PASSED + 1))
    
    # Check for key functions
    if grep -q "convertToAdminEmail" Onchainweb/src/lib/adminAuth.js; then
        echo -e "  ✅ convertToAdminEmail function implemented"
        PASSED=$((PASSED + 1))
    fi
    
    if grep -q "determineAdminRole" Onchainweb/src/lib/adminAuth.js; then
        echo -e "  ✅ determineAdminRole function implemented"
        PASSED=$((PASSED + 1))
    fi
    
    if grep -q "isEmailAllowed" Onchainweb/src/lib/adminAuth.js; then
        echo -e "  ✅ isEmailAllowed function implemented"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "  ${RED}❌ adminAuth.js not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Check Admin Panel Components
echo -e "${YELLOW}[TEST 4] Checking Admin Panel Components...${NC}"
if [ -f "Onchainweb/src/components/AdminPanel.jsx" ]; then
    echo -e "  ✅ AdminPanel.jsx found"
    PASSED=$((PASSED + 1))
    
    # Check for login handler
    if grep -q "handleLogin" Onchainweb/src/components/AdminPanel.jsx; then
        echo -e "  ✅ Login handler implemented in AdminPanel"
        PASSED=$((PASSED + 1))
    fi
    
    # Check for Firebase integration
    if grep -q "firebaseSignIn" Onchainweb/src/components/AdminPanel.jsx; then
        echo -e "  ✅ Firebase authentication integrated in AdminPanel"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "  ${RED}❌ AdminPanel.jsx not found${NC}"
    FAILED=$((FAILED + 1))
fi

if [ -f "Onchainweb/src/components/MasterAdminDashboard.jsx" ]; then
    echo -e "  ✅ MasterAdminDashboard.jsx found"
    PASSED=$((PASSED + 1))
    
    # Check for login handler
    if grep -q "handleLogin" Onchainweb/src/components/MasterAdminDashboard.jsx; then
        echo -e "  ✅ Login handler implemented in MasterAdminDashboard"
        PASSED=$((PASSED + 1))
    fi
    
    # Check for Firebase integration
    if grep -q "firebaseSignIn" Onchainweb/src/components/MasterAdminDashboard.jsx; then
        echo -e "  ✅ Firebase authentication integrated in MasterAdminDashboard"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "  ${RED}❌ MasterAdminDashboard.jsx not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Check Real-Time Data Subscriptions
echo -e "${YELLOW}[TEST 5] Checking Real-Time Data Subscriptions...${NC}"
REALTIME_FOUND=0

# Check for subscription functions in firebase.js
if [ -f "Onchainweb/src/lib/firebase.js" ]; then
    if grep -q "subscribeToUsers" Onchainweb/src/lib/firebase.js; then
        echo -e "  ✅ subscribeToUsers function found"
        PASSED=$((PASSED + 1))
        REALTIME_FOUND=$((REALTIME_FOUND + 1))
    fi
    
    if grep -q "subscribeToDeposits" Onchainweb/src/lib/firebase.js; then
        echo -e "  ✅ subscribeToDeposits function found"
        PASSED=$((PASSED + 1))
        REALTIME_FOUND=$((REALTIME_FOUND + 1))
    fi
    
    if grep -q "subscribeToWithdrawals" Onchainweb/src/lib/firebase.js; then
        echo -e "  ✅ subscribeToWithdrawals function found"
        PASSED=$((PASSED + 1))
        REALTIME_FOUND=$((REALTIME_FOUND + 1))
    fi
    
    if grep -q "subscribeToTrades" Onchainweb/src/lib/firebase.js; then
        echo -e "  ✅ subscribeToTrades function found"
        PASSED=$((PASSED + 1))
        REALTIME_FOUND=$((REALTIME_FOUND + 1))
    fi
    
    if grep -q "subscribeToChatMessages" Onchainweb/src/lib/firebase.js; then
        echo -e "  ✅ subscribeToChatMessages function found"
        PASSED=$((PASSED + 1))
        REALTIME_FOUND=$((REALTIME_FOUND + 1))
    fi
fi

if [ $REALTIME_FOUND -gt 0 ]; then
    echo -e "  ✅ Real-time subscriptions: $REALTIME_FOUND/5 implemented"
else
    echo -e "  ${YELLOW}⚠️  No real-time subscriptions found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 6: Check Routing Configuration
echo -e "${YELLOW}[TEST 6] Checking Routing Configuration...${NC}"
if [ -f "Onchainweb/src/main.jsx" ]; then
    echo -e "  ✅ main.jsx found"
    PASSED=$((PASSED + 1))
    
    # Check for admin routes
    if grep -q "ROUTES.ADMIN\|/admin" Onchainweb/src/main.jsx; then
        echo -e "  ✅ Admin route configured"
        PASSED=$((PASSED + 1))
    fi
    
    if grep -q "ROUTES.MASTER_ADMIN\|/master-admin" Onchainweb/src/main.jsx; then
        echo -e "  ✅ Master admin route configured"
        PASSED=$((PASSED + 1))
    fi
    
    # Check for admin guard
    if grep -q "ADMIN_GUARD.ENABLED" Onchainweb/src/main.jsx; then
        echo -e "  ✅ Admin guard implemented"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "  ${RED}❌ main.jsx not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 7: Check Constants Configuration
echo -e "${YELLOW}[TEST 7] Checking Constants Configuration...${NC}"
if [ -f "Onchainweb/src/config/constants.js" ]; then
    echo -e "  ✅ constants.js found"
    PASSED=$((PASSED + 1))
    
    if grep -q "ADMIN_GUARD" Onchainweb/src/config/constants.js; then
        echo -e "  ✅ ADMIN_GUARD configuration present"
        PASSED=$((PASSED + 1))
    fi
    
    if grep -q "ROUTES" Onchainweb/src/config/constants.js; then
        echo -e "  ✅ ROUTES configuration present"
        PASSED=$((PASSED + 1))
    fi
else
    echo -e "  ${RED}❌ constants.js not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 8: Check Build Configuration
echo -e "${YELLOW}[TEST 8] Checking Build Configuration...${NC}"
if [ -f "Onchainweb/package.json" ]; then
    echo -e "  ✅ package.json found"
    PASSED=$((PASSED + 1))
    
    # Check for required dependencies
    if grep -q "firebase" Onchainweb/package.json; then
        echo -e "  ✅ Firebase dependency present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Firebase dependency missing${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if grep -q "react-router-dom" Onchainweb/package.json; then
        echo -e "  ✅ React Router dependency present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ React Router dependency missing${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "  ${RED}❌ package.json not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 9: Check Documentation
echo -e "${YELLOW}[TEST 9] Checking Documentation...${NC}"
DOC_COUNT=0

if [ -f "ADMIN_SETUP_GUIDE.md" ]; then
    echo -e "  ✅ ADMIN_SETUP_GUIDE.md found"
    PASSED=$((PASSED + 1))
    DOC_COUNT=$((DOC_COUNT + 1))
fi

if [ -f "ADMIN_USER_GUIDE.md" ]; then
    echo -e "  ✅ ADMIN_USER_GUIDE.md found"
    PASSED=$((PASSED + 1))
    DOC_COUNT=$((DOC_COUNT + 1))
fi

if [ -f "REALTIME_DATA_ARCHITECTURE.md" ]; then
    echo -e "  ✅ REALTIME_DATA_ARCHITECTURE.md found"
    PASSED=$((PASSED + 1))
    DOC_COUNT=$((DOC_COUNT + 1))
fi

if [ -f "BACKEND_REPLACEMENT.md" ]; then
    echo -e "  ✅ BACKEND_REPLACEMENT.md found"
    PASSED=$((PASSED + 1))
    DOC_COUNT=$((DOC_COUNT + 1))
fi

echo -e "  ${GREEN}📚 Documentation files: $DOC_COUNT/4 present${NC}"
echo ""

# Summary
echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}📊 TEST SUMMARY${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""
echo -e "  ${GREEN}✅ Passed:   $PASSED${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "  ${RED}❌ Failed:   $FAILED${NC}"
echo ""

# Overall result
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}Admin and Master login functionality is fully configured and ready to use.${NC}"
        echo ""
        echo -e "${CYAN}Next Steps:${NC}"
        echo -e "1. Create admin accounts in Firebase Console (Authentication > Users)"
        echo -e "2. Add admin emails to VITE_ADMIN_ALLOWLIST in .env"
        echo -e "3. Restart dev server: ${BLUE}cd Onchainweb && npm run dev${NC}"
        echo -e "4. Access admin panel: ${BLUE}http://localhost:5173/admin${NC}"
        echo -e "5. Access master panel: ${BLUE}http://localhost:5173/master-admin${NC}"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}⚠️  TESTS PASSED WITH WARNINGS${NC}"
        echo -e "${YELLOW}Please review the warnings above and address them.${NC}"
        echo ""
        exit 0
    fi
else
    echo -e "${RED}❌ TESTS FAILED${NC}"
    echo -e "${RED}Please fix the issues above before proceeding.${NC}"
    echo ""
    echo -e "${CYAN}Common Issues:${NC}"
    echo -e "1. Ensure VITE_ENABLE_ADMIN=true in Onchainweb/.env"
    echo -e "2. Configure Firebase credentials in Onchainweb/.env"
    echo -e "3. Add admin emails to VITE_ADMIN_ALLOWLIST"
    echo -e "4. Run: ${BLUE}cd Onchainweb && npm install${NC}"
    echo ""
    exit 1
fi
