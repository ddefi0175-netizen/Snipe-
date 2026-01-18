#!/bin/bash
# ===========================================
# Snipe Public Release Verification Script
# ===========================================
# Comprehensive verification of all features before public release
# Usage: MASTER_PASSWORD='your-password' ./verify-public-release.sh [API_URL]
# Example: MASTER_PASSWORD='secret123' ./verify-public-release.sh https://snipe-api.onrender.com/api

set -e

# Configuration
API_BASE="${1:-https://snipe-api.onrender.com/api}"
MASTER_USER="${MASTER_USERNAME:-snipe_admin_secure_7ecb869e}"
MASTER_PASS="${MASTER_PASSWORD:-WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E=}"
FRONTEND_URL="${FRONTEND_URL:-https://www.onchainweb.app}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}🚀 SNIPE PUBLIC RELEASE VERIFICATION${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "API Base: ${BLUE}$API_BASE${NC}"
echo -e "Frontend: ${BLUE}$FRONTEND_URL${NC}"
echo ""

# Validate required environment variables
if [ -z "$MASTER_PASS" ]; then
  echo -e "${RED}❌ ERROR: MASTER_PASSWORD environment variable is required${NC}"
  echo "Usage: MASTER_PASSWORD='your-password' ./verify-public-release.sh"
  exit 1
fi

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local auth="$5"
    local expect_key="$6"

    printf "%-50s" "  Testing: $name..."

    # Build and execute curl command safely
    local HTTP_RESPONSE
    if [ -n "$auth" ] && [ -n "$data" ]; then
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}' -X "$method" "${API_BASE}${endpoint}" \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $auth" \
            -d "$data" 2>/dev/null || echo '{"error":"connection failed"}\n000')
    elif [ -n "$auth" ]; then
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}' -X "$method" "${API_BASE}${endpoint}" \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $auth" 2>/dev/null || echo '{"error":"connection failed"}\n000')
    elif [ -n "$data" ]; then
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}' -X "$method" "${API_BASE}${endpoint}" \
            -H 'Content-Type: application/json' \
            -d "$data" 2>/dev/null || echo '{"error":"connection failed"}\n000')
    else
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}' -X "$method" "${API_BASE}${endpoint}" \
            -H 'Content-Type: application/json' 2>/dev/null || echo '{"error":"connection failed"}\n000')
    fi

    # Parse response
    local FULL_RESPONSE="$HTTP_RESPONSE"
    local RESPONSE=$(echo "$FULL_RESPONSE" | head -n -1)
    local HTTP_CODE=$(echo "$FULL_RESPONSE" | tail -n 1)

    # Check for expected key in response and HTTP code
    if echo "$RESPONSE" | grep -q "$expect_key" && [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        echo -e " ${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e " ${RED}❌ FAIL${NC} (HTTP $HTTP_CODE)"
        echo -e "     ${YELLOW}Response: $(echo $RESPONSE | head -c 150)${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Test frontend accessibility
test_frontend() {
    local url="$1"
    printf "%-50s" "  Testing: Frontend at $url..."

    local HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
        echo -e " ${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e " ${RED}❌ FAIL${NC} (HTTP $HTTP_CODE)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# =============================================
# 1. INFRASTRUCTURE HEALTH
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 SECTION 1: Infrastructure Health${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_frontend "$FRONTEND_URL"
test_endpoint "Backend health check" "GET" "/health" "" "" "ok"

# =============================================
# 2. AUTHENTICATION SYSTEM
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔐 SECTION 2: Authentication System${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Master login
MASTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$MASTER_USER\",\"password\":\"$MASTER_PASS\"}" 2>/dev/null)

MASTER_TOKEN=$(echo "$MASTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

printf "%-50s" "  Testing: Master account login..."
if [ -n "$MASTER_TOKEN" ] && [ "$MASTER_TOKEN" != "null" ]; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))

    # Extract role and verify it's master
    ROLE=$(echo "$MASTER_RESPONSE" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
    printf "%-50s" "  Testing: Master role verification..."
    if [ "$ROLE" == "master" ]; then
        echo -e " ${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e " ${YELLOW}⚠️  WARN${NC} (Expected 'master', got '$ROLE')"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e " ${RED}❌ FAIL${NC}"
    echo -e "     ${YELLOW}Response: $(echo $MASTER_RESPONSE | head -c 150)${NC}"
    FAILED=$((FAILED + 1))
    echo -e "${RED}Cannot continue without master token. Exiting...${NC}"
    exit 1
fi

# Test token verification
if [ -n "$MASTER_TOKEN" ]; then
    test_endpoint "Token verification" "GET" "/auth/status" "" "$MASTER_TOKEN" "username"
fi

# =============================================
# 3. ADMIN MANAGEMENT & PERMISSIONS
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}👥 SECTION 3: Admin Management & Permissions${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$MASTER_TOKEN" ]; then
    test_endpoint "List admin accounts" "GET" "/auth/admins" "" "$MASTER_TOKEN" "username"
    test_endpoint "Admin activity logs" "GET" "/admin-activity?limit=10" "" "$MASTER_TOKEN" "timestamp"

    # Test creating a temporary admin (will be deleted)
    TIMESTAMP=$(date +%s)
    TEST_ADMIN="release_test_$TIMESTAMP"

    printf "%-50s" "  Testing: Create admin account..."
    CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/admin" \
        -H "Authorization: Bearer $MASTER_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$TEST_ADMIN\",\"password\":\"TestPass123!\",\"email\":\"test@example.com\",\"permissions\":{\"manageUsers\":true}}")

    if echo "$CREATE_RESPONSE" | grep -q "success\|admin"; then
        echo -e " ${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))

        # Test the new admin can login
        printf "%-50s" "  Testing: New admin login..."
        ADMIN_LOGIN=$(curl -s -X POST "${API_BASE}/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$TEST_ADMIN\",\"password\":\"TestPass123!\"}")

        if echo "$ADMIN_LOGIN" | grep -q "token"; then
            echo -e " ${GREEN}✅ PASS${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e " ${RED}❌ FAIL${NC}"
            FAILED=$((FAILED + 1))
        fi

        # Cleanup: Delete test admin
        printf "%-50s" "  Cleanup: Delete test admin..."
        DELETE_RESPONSE=$(curl -s -X DELETE "${API_BASE}/auth/admin/$TEST_ADMIN" \
            -H "Authorization: Bearer $MASTER_TOKEN")

        if echo "$DELETE_RESPONSE" | grep -q "success\|deleted"; then
            echo -e " ${GREEN}✅ PASS${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e " ${YELLOW}⚠️  WARN${NC} (Couldn't delete test admin - manual cleanup may be needed)"
            echo -e "     ${YELLOW}Test admin '$TEST_ADMIN' may need manual deletion${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e " ${RED}❌ FAIL${NC}"
        echo -e "     ${YELLOW}Response: $(echo $CREATE_RESPONSE | head -c 150)${NC}"
        FAILED=$((FAILED + 1))
    fi
fi

# =============================================
# 4. REAL-TIME DATA FEATURES
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}⚡ SECTION 4: Real-Time Data Features${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$MASTER_TOKEN" ]; then
    test_endpoint "User list with metadata" "GET" "/users?limit=10" "" "$MASTER_TOKEN" "realTime"
    test_endpoint "Settings" "GET" "/settings" "" "$MASTER_TOKEN" "siteName"
    test_endpoint "Trading levels" "GET" "/trading-levels" "" "$MASTER_TOKEN" "level"
    test_endpoint "Currencies" "GET" "/currencies" "" "$MASTER_TOKEN" "symbol"
    test_endpoint "Networks" "GET" "/networks" "" "$MASTER_TOKEN" "symbol"
    test_endpoint "Deposit wallets" "GET" "/deposit-wallets" "" "$MASTER_TOKEN" "network"
    test_endpoint "Exchange rates" "GET" "/rates" "" "$MASTER_TOKEN" "rate"
fi

# =============================================
# 5. CHAT SYSTEM
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}💬 SECTION 5: Live Chat System${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test chat functionality
printf "%-50s" "  Testing: User send message (no auth)..."
CHAT_RESPONSE=$(curl -s -X POST "${API_BASE}/chat/messages" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"release-test-$TIMESTAMP\",\"message\":\"Release verification test\",\"senderName\":\"VerificationBot\"}" 2>/dev/null)

if echo "$CHAT_RESPONSE" | grep -q "message\|success"; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e " ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Test admin can see chats
if [ -n "$MASTER_TOKEN" ]; then
    test_endpoint "Admin get chat sessions" "GET" "/chat/admin/chats" "" "$MASTER_TOKEN" "sessionId"

    # Cleanup: Delete test chat session
    printf "%-50s" "  Cleanup: Delete test chat session..."
    CLEANUP_RESPONSE=$(curl -s -X DELETE "${API_BASE}/chat/sessions/release-test-$TIMESTAMP" \
        -H "Authorization: Bearer $MASTER_TOKEN" 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e " ${GREEN}✅ DONE${NC}"
    else
        echo -e " ${YELLOW}⚠️  WARN${NC} (Chat cleanup may have failed)"
    fi
fi

# =============================================
# 6. WALLET CONNECTION CONFIGURATION
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔗 SECTION 6: Wallet Connection Configuration${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

printf "%-50s" "  Checking: WalletConnect implementation..."
if [ -f "Onchainweb/src/lib/walletConnect.jsx" ]; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))

    # Check for WalletConnect dependency
    printf "%-50s" "  Checking: WalletConnect dependency..."
    if grep -q "@walletconnect/universal-provider" "Onchainweb/package.json"; then
        echo -e " ${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e " ${RED}❌ FAIL${NC}"
        FAILED=$((FAILED + 1))
    fi

    # Check for supported wallets in code
    printf "%-50s" "  Checking: Wallet providers configuration..."
    WALLET_COUNT=$(grep -o "id: '[^']*'" Onchainweb/src/lib/walletConnect.jsx | wc -l)
    if [ "$WALLET_COUNT" -ge 10 ]; then
        echo -e " ${GREEN}✅ PASS${NC} ($WALLET_COUNT wallets configured)"
        PASSED=$((PASSED + 1))
    else
        echo -e " ${YELLOW}⚠️  WARN${NC} (Only $WALLET_COUNT wallets found, expected 10+)"
        WARNINGS=$((WARNINGS + 1))
    fi

    # Check environment variable documentation
    printf "%-50s" "  Checking: WalletConnect env var documented..."
    if grep -q "VITE_WALLETCONNECT_PROJECT_ID" "Onchainweb/.env.example"; then
        echo -e " ${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e " ${YELLOW}⚠️  WARN${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e " ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# =============================================
# 7. SECURITY & DOCUMENTATION
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🔒 SECTION 7: Security & Documentation${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check for credentials in code (excluding common false positives)
printf "%-50s" "  Checking: No hardcoded credentials..."
CRED_CHECK=$(grep -r -i "password.*=.*['\"][^'\"]*['\"]" backend/ Onchainweb/src/ 2>/dev/null | \
    grep -v "env\|example\|placeholder\|TODO\|comment\|test\|mock" | \
    grep -v "Password must be\|password validation\|placeholder\|minLength\|maxLength" | \
    grep -v "\.test\.\|\.spec\.\|__tests__" | wc -l)
if [ "$CRED_CHECK" -eq 0 ]; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e " ${YELLOW}⚠️  WARN${NC} (Found $CRED_CHECK potential credential references)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check critical documentation files
DOCS=("README.md" "DEPLOYMENT.md" "MAINTENANCE.md" "RELEASE_CHECKLIST.md" "ADMIN_USER_GUIDE.md" "WALLETCONNECT_IMPLEMENTATION.md")
for doc in "${DOCS[@]}"; do
    printf "%-50s" "  Checking: $doc exists..."
    if [ -f "$doc" ]; then
        echo -e " ${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e " ${RED}❌ FAIL${NC}"
        FAILED=$((FAILED + 1))
    fi
done

# Check .gitignore for sensitive files
printf "%-50s" "  Checking: .gitignore configured..."
if [ -f ".gitignore" ]; then
    if grep -q ".env" ".gitignore" && grep -q "node_modules" ".gitignore"; then
        echo -e " ${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e " ${YELLOW}⚠️  WARN${NC} (.gitignore missing critical entries)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e " ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# =============================================
# 8. BUILD & DEPLOYMENT READINESS
# =============================================
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🏗️  SECTION 8: Build & Deployment Readiness${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check package.json files
printf "%-50s" "  Checking: Backend package.json..."
if [ -f "backend/package.json" ]; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e " ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

printf "%-50s" "  Checking: Frontend package.json..."
if [ -f "Onchainweb/package.json" ]; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e " ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Check for environment variable examples
printf "%-50s" "  Checking: Backend .env.example..."
if [ -f "backend/.env.example" ]; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e " ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

printf "%-50s" "  Checking: Frontend .env.example..."
if [ -f "Onchainweb/.env.example" ]; then
    echo -e " ${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e " ${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# =============================================
# FINAL SUMMARY
# =============================================
echo ""
echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}📊 VERIFICATION SUMMARY${NC}"
echo -e "${CYAN}=================================================${NC}"
TOTAL=$((PASSED + FAILED + WARNINGS))
echo -e "Total Checks: ${BLUE}$TOTAL${NC}"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"
echo -e "Warnings:     ${YELLOW}$WARNINGS${NC}"
echo ""

# Calculate success percentage
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
else
    SUCCESS_RATE=0
fi

echo -e "Success Rate: ${BLUE}${SUCCESS_RATE}%${NC}"
echo ""

# Final verdict
if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! Ready for public release.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  ALL TESTS PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}Review warnings above before public release.${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo -e "${RED}Fix issues above before public release.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
