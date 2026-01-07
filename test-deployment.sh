#!/bin/bash
# ===========================================
# Snipe Deployment Test Script
# ===========================================
# Tests all API endpoints to verify deployment
# Usage: ./test-deployment.sh [API_URL]
# Example: ./test-deployment.sh https://snipe-api.onrender.com/api

# Configuration
API_BASE="${1:-https://snipe-api.onrender.com/api}"
MASTER_USER="master"
MASTER_PASS="OnchainWeb2025!"
ADMIN_USER="aqiang"
ADMIN_PASS="Aqiang2026!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================="
echo "🔍 SNIPE DEPLOYMENT TEST"
echo "================================================="
echo "API Base: $API_BASE"
echo ""

# Track results
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local auth="$5"
    local expect_key="$6"
    
    printf "%-40s" "Testing: $name..."
    
    # Build curl command
    CMD="curl -s -X $method ${API_BASE}${endpoint}"
    CMD="$CMD -H 'Content-Type: application/json'"
    
    if [ -n "$auth" ]; then
        CMD="$CMD -H 'Authorization: Bearer $auth'"
    fi
    
    if [ -n "$data" ]; then
        CMD="$CMD -d '$data'"
    fi
    
    # Execute and capture response
    RESPONSE=$(eval $CMD 2>/dev/null || echo '{"error":"connection failed"}')
    
    # Check for expected key in response
    if echo "$RESPONSE" | grep -q "$expect_key"; then
        echo -e " ${GREEN}✅ PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e " ${RED}❌ FAILED${NC}"
        echo "   Response: $(echo $RESPONSE | head -c 100)"
        FAILED=$((FAILED + 1))
    fi
}

# =============================================
# 1. HEALTH CHECK
# =============================================
echo ""
echo "📌 Health & Connectivity"
echo "-----------------------------------------"
test_endpoint "Health check" "GET" "/health" "" "" "ok"

# =============================================
# 2. AUTHENTICATION
# =============================================
echo ""
echo "🔐 Authentication"
echo "-----------------------------------------"

# Master login
MASTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$MASTER_USER\",\"password\":\"$MASTER_PASS\"}" 2>/dev/null)

MASTER_TOKEN=$(echo "$MASTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$MASTER_TOKEN" ] && [ "$MASTER_TOKEN" != "null" ]; then
    echo -e "Testing: Master login...                     ${GREEN}✅ PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "Testing: Master login...                     ${RED}❌ FAILED${NC}"
    echo "   Response: $(echo $MASTER_RESPONSE | head -c 100)"
    FAILED=$((FAILED + 1))
fi

# Admin login  
ADMIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" 2>/dev/null)

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    echo -e "Testing: Admin login...                      ${GREEN}✅ PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "Testing: Admin login...                      ${RED}❌ FAILED${NC}"
    echo "   Response: $(echo $ADMIN_RESPONSE | head -c 100)"
    FAILED=$((FAILED + 1))
fi

# =============================================
# 3. CONFIGURATION ENDPOINTS (Authenticated)
# =============================================
echo ""
echo "⚙️  Configuration APIs (requires auth)"
echo "-----------------------------------------"

if [ -n "$MASTER_TOKEN" ]; then
    test_endpoint "Get settings" "GET" "/settings" "" "$MASTER_TOKEN" "siteName"
    test_endpoint "Get trading levels" "GET" "/trading-levels" "" "$MASTER_TOKEN" "level"
    test_endpoint "Get currencies" "GET" "/currencies" "" "$MASTER_TOKEN" "symbol"
    test_endpoint "Get networks" "GET" "/networks" "" "$MASTER_TOKEN" "symbol"
    test_endpoint "Get deposit wallets" "GET" "/deposit-wallets" "" "$MASTER_TOKEN" "network"
    test_endpoint "Get exchange rates" "GET" "/rates" "" "$MASTER_TOKEN" "rate"
    test_endpoint "Get admins list" "GET" "/auth/admins" "" "$MASTER_TOKEN" "username"
else
    echo -e "${YELLOW}⚠️  Skipping auth tests - no token${NC}"
fi

# =============================================
# 4. CHAT SYSTEM
# =============================================
echo ""
echo "💬 Chat System"
echo "-----------------------------------------"

# User sends message (no auth required)
CHAT_RESPONSE=$(curl -s -X POST "${API_BASE}/chat/messages" \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"test-deployment-check","message":"Deployment test","senderName":"TestBot"}' 2>/dev/null)

if echo "$CHAT_RESPONSE" | grep -q "message"; then
    echo -e "Testing: User send message...                ${GREEN}✅ PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "Testing: User send message...                ${RED}❌ FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

# Admin sees chats
if [ -n "$MASTER_TOKEN" ]; then
    test_endpoint "Admin get chats" "GET" "/chat/admin/chats" "" "$MASTER_TOKEN" "sessionId"
    
    # Clean up test chat
    curl -s -X DELETE "${API_BASE}/chat/sessions/test-deployment-check" \
        -H "Authorization: Bearer $MASTER_TOKEN" > /dev/null 2>&1
fi

# =============================================
# 5. USER MANAGEMENT
# =============================================
echo ""
echo "👥 User Management"
echo "-----------------------------------------"
if [ -n "$MASTER_TOKEN" ]; then
    test_endpoint "Get users list" "GET" "/users" "" "$MASTER_TOKEN" "\["
fi

# =============================================
# SUMMARY
# =============================================
echo ""
echo "================================================="
echo "📊 TEST SUMMARY"
echo "================================================="
TOTAL=$((PASSED + FAILED))
echo -e "Total Tests: $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Deployment is healthy.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the output above.${NC}"
    exit 1
fi
