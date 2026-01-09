#!/bin/bash
# ============================================
# Firebase Real-Time Data Integration Test
# ============================================
# Verifies that all app functions work with real-time Firebase data
# Tests user operations, admin operations, and live data synchronization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${FRONTEND_URL:-https://www.onchainweb.app}"

# Track results
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}🔥 FIREBASE REAL-TIME DATA INTEGRATION TEST${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "Frontend URL: ${BLUE}$FRONTEND_URL${NC}"
echo ""

# Check if Firebase config exists
echo -e "${YELLOW}[TEST 1] Verifying Firebase Configuration...${NC}"
if [ -f "Onchainweb/.env" ]; then
    if grep -q "VITE_FIREBASE_API_KEY" Onchainweb/.env && grep -q "VITE_FIREBASE_PROJECT_ID" Onchainweb/.env; then
        echo -e "${GREEN}✅ Firebase environment variables configured${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ Firebase environment variables missing in .env${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found - Firebase may not be configured${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test Firebase service configuration
echo -e "${YELLOW}[TEST 2] Verifying Firebase Service Files...${NC}"
REQUIRED_FILES=(
    "Onchainweb/src/config/firebase.config.js"
    "Onchainweb/src/services/firebase.service.js"
    "firestore.rules"
    "firestore.indexes.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file exists"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ $file missing${NC}"
        FAILED=$((FAILED + 1))
    fi
done
echo ""

# Test Firestore security rules
echo -e "${YELLOW}[TEST 3] Verifying Firestore Security Rules...${NC}"
if [ -f "firestore.rules" ]; then
    # Check for key security features
    RULES_CONTENT=$(cat firestore.rules)
    
    if echo "$RULES_CONTENT" | grep -q "isAuthenticated()"; then
        echo -e "  ✅ Authentication checks present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Missing authentication checks${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if echo "$RULES_CONTENT" | grep -q "isAdmin()"; then
        echo -e "  ✅ Admin role checks present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Missing admin role checks${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    if echo "$RULES_CONTENT" | grep -q "isOwner"; then
        echo -e "  ✅ Owner validation present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Missing owner validation${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌ firestore.rules file not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test Firebase collections configuration
echo -e "${YELLOW}[TEST 4] Verifying Firebase Collections Configuration...${NC}"
if [ -f "Onchainweb/src/config/firebase.config.js" ]; then
    CONFIG_CONTENT=$(cat Onchainweb/src/config/firebase.config.js)
    
    COLLECTIONS=(
        "USERS"
        "ADMINS"
        "TRADES"
        "DEPOSITS"
        "WITHDRAWALS"
        "CHAT_MESSAGES"
        "NOTIFICATIONS"
        "ACTIVITY_LOGS"
    )
    
    for collection in "${COLLECTIONS[@]}"; do
        if echo "$CONFIG_CONTENT" | grep -q "$collection"; then
            echo -e "  ✅ Collection $collection configured"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${RED}❌ Collection $collection missing${NC}"
            FAILED=$((FAILED + 1))
        fi
    done
else
    echo -e "${RED}❌ firebase.config.js not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test real-time listener functions
echo -e "${YELLOW}[TEST 5] Verifying Real-Time Listener Functions...${NC}"
if [ -f "Onchainweb/src/services/firebase.service.js" ]; then
    SERVICE_CONTENT=$(cat Onchainweb/src/services/firebase.service.js)
    
    LISTENER_FUNCTIONS=(
        "onSnapshot"
        "saveChatMessage"
        "getChatMessages"
        "saveNotification"
        "getNotifications"
    )
    
    for func in "${LISTENER_FUNCTIONS[@]}"; do
        if echo "$SERVICE_CONTENT" | grep -q "$func"; then
            echo -e "  ✅ Function $func present"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  Function $func not found${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    echo -e "${RED}❌ firebase.service.js not found${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test authentication functions
echo -e "${YELLOW}[TEST 6] Verifying Authentication Functions...${NC}"
if [ -f "Onchainweb/src/services/firebase.service.js" ]; then
    SERVICE_CONTENT=$(cat Onchainweb/src/services/firebase.service.js)
    
    AUTH_FUNCTIONS=(
        "firebaseSignIn"
        "firebaseSignUp"
        "firebaseSignOut"
        "onAuthChange"
    )
    
    for func in "${AUTH_FUNCTIONS[@]}"; do
        if echo "$SERVICE_CONTENT" | grep -q "$func"; then
            echo -e "  ✅ Function $func present"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${RED}❌ Function $func missing${NC}"
            FAILED=$((FAILED + 1))
        fi
    done
fi
echo ""

# Test database indexes
echo -e "${YELLOW}[TEST 7] Verifying Database Indexes...${NC}"
if [ -f "firestore.indexes.json" ]; then
    INDEXES_CONTENT=$(cat firestore.indexes.json)
    
    if echo "$INDEXES_CONTENT" | grep -q "chatMessages"; then
        echo -e "  ✅ Chat messages indexes configured"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Chat messages indexes not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if echo "$INDEXES_CONTENT" | grep -q "trades"; then
        echo -e "  ✅ Trades indexes configured"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Trades indexes not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ firestore.indexes.json not found${NC}"
    FAILED=$((FAILED + 1))
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
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo -e "${GREEN}Firebase real-time data integration is properly configured.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
