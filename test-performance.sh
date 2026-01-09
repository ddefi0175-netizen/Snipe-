#!/bin/bash
# ===========================================
# Snipe Performance Testing Script
# ===========================================
# Tests loading times and responsiveness for admin/master accounts
# Usage: MASTER_PASSWORD='your-password' ./test-performance.sh [API_URL] [FRONTEND_URL]

set -e

# Configuration
API_BASE="${1:-https://snipe-api.onrender.com/api}"
FRONTEND_URL="${2:-https://www.onchainweb.app}"
MASTER_USER="${MASTER_USERNAME:-master}"
MASTER_PASS="${MASTER_PASSWORD}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Performance thresholds (milliseconds)
THRESHOLD_EXCELLENT=500
THRESHOLD_GOOD=1000
THRESHOLD_ACCEPTABLE=2000
THRESHOLD_SLOW=3000

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}🚀 SNIPE PERFORMANCE TESTING${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "API Base: ${BLUE}$API_BASE${NC}"
echo -e "Frontend: ${BLUE}$FRONTEND_URL${NC}"
echo -e ""

# Validate required environment variables
if [ -z "$MASTER_PASS" ]; then
  echo -e "${RED}❌ ERROR: MASTER_PASSWORD environment variable is required${NC}"
  echo "Usage: MASTER_PASSWORD='your-password' ./test-performance.sh"
  exit 1
fi

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

# Function to measure response time
measure_time() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local auth="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    printf "%-50s" "  Testing: $name..."
    
    # Measure time in milliseconds
    local start_time=$(date +%s%3N)
    
    # Make the request
    if [ -n "$auth" ] && [ -n "$data" ]; then
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}\n%{time_total}' -X "$method" "$url" \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $auth" \
            -d "$data" 2>/dev/null || echo '{"error":"connection failed"}\n000\n999')
    elif [ -n "$auth" ]; then
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}\n%{time_total}' -X "$method" "$url" \
            -H 'Content-Type: application/json' \
            -H "Authorization: Bearer $auth" 2>/dev/null || echo '{"error":"connection failed"}\n000\n999')
    elif [ -n "$data" ]; then
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}\n%{time_total}' -X "$method" "$url" \
            -H 'Content-Type: application/json' \
            -d "$data" 2>/dev/null || echo '{"error":"connection failed"}\n000\n999')
    else
        HTTP_RESPONSE=$(curl -s -w '\n%{http_code}\n%{time_total}' -X "$method" "$url" \
            -H 'Content-Type: application/json' 2>/dev/null || echo '{"error":"connection failed"}\n000\n999')
    fi
    
    local end_time=$(date +%s%3N)
    
    # Parse response
    local RESPONSE=$(echo "$HTTP_RESPONSE" | head -n -2)
    local HTTP_CODE=$(echo "$HTTP_RESPONSE" | tail -n 2 | head -n 1)
    local CURL_TIME=$(echo "$HTTP_RESPONSE" | tail -n 1)
    
    # Calculate time in milliseconds
    local TIME_MS=$(echo "$CURL_TIME * 1000" | bc | cut -d. -f1)
    
    # Determine status based on time and HTTP code
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        if [ "$TIME_MS" -lt "$THRESHOLD_EXCELLENT" ]; then
            echo -e " ${GREEN}✅ EXCELLENT${NC} (${TIME_MS}ms | HTTP $HTTP_CODE)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        elif [ "$TIME_MS" -lt "$THRESHOLD_GOOD" ]; then
            echo -e " ${GREEN}✅ GOOD${NC} (${TIME_MS}ms | HTTP $HTTP_CODE)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        elif [ "$TIME_MS" -lt "$THRESHOLD_ACCEPTABLE" ]; then
            echo -e " ${YELLOW}⚠️  ACCEPTABLE${NC} (${TIME_MS}ms | HTTP $HTTP_CODE)"
            WARNING_TESTS=$((WARNING_TESTS + 1))
        elif [ "$TIME_MS" -lt "$THRESHOLD_SLOW" ]; then
            echo -e " ${YELLOW}⚠️  SLOW${NC} (${TIME_MS}ms | HTTP $HTTP_CODE)"
            WARNING_TESTS=$((WARNING_TESTS + 1))
        else
            echo -e " ${RED}❌ TOO SLOW${NC} (${TIME_MS}ms | HTTP $HTTP_CODE)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e " ${RED}❌ FAILED${NC} (${TIME_MS}ms | HTTP $HTTP_CODE)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Return the time for further use
    echo "$TIME_MS"
}

# Function to measure frontend page load
measure_frontend() {
    local name="$1"
    local url="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    printf "%-50s" "  Testing: $name..."
    
    # Measure time to get first byte and total time
    local CURL_OUTPUT=$(curl -s -o /dev/null -w '%{time_total},%{http_code},%{size_download}' "$url" 2>/dev/null || echo '999,000,0')
    
    local TIME_TOTAL=$(echo "$CURL_OUTPUT" | cut -d, -f1)
    local HTTP_CODE=$(echo "$CURL_OUTPUT" | cut -d, -f2)
    local SIZE=$(echo "$CURL_OUTPUT" | cut -d, -f3)
    
    # Convert to milliseconds
    local TIME_MS=$(echo "$TIME_TOTAL * 1000" | bc | cut -d. -f1)
    
    # Determine status
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        if [ "$TIME_MS" -lt "$THRESHOLD_GOOD" ]; then
            echo -e " ${GREEN}✅ FAST${NC} (${TIME_MS}ms | ${SIZE} bytes)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        elif [ "$TIME_MS" -lt "$THRESHOLD_ACCEPTABLE" ]; then
            echo -e " ${GREEN}✅ GOOD${NC} (${TIME_MS}ms | ${SIZE} bytes)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        elif [ "$TIME_MS" -lt "$THRESHOLD_SLOW" ]; then
            echo -e " ${YELLOW}⚠️  ACCEPTABLE${NC} (${TIME_MS}ms | ${SIZE} bytes)"
            WARNING_TESTS=$((WARNING_TESTS + 1))
        else
            echo -e " ${RED}❌ SLOW${NC} (${TIME_MS}ms | ${SIZE} bytes)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e " ${RED}❌ FAILED${NC} (HTTP $HTTP_CODE)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}1. Frontend Page Load Performance${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

measure_frontend "Homepage" "$FRONTEND_URL"
measure_frontend "Admin Login Page" "$FRONTEND_URL/admin"
measure_frontend "Master Admin Page" "$FRONTEND_URL/master-admin"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}2. Backend API Health Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

measure_time "Health Check" "$API_BASE/../health" "GET" "" "" > /dev/null

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}3. Authentication Performance${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test master login
LOGIN_DATA=$(cat <<EOF
{"username":"$MASTER_USER","password":"$MASTER_PASS"}
EOF
)

LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "$LOGIN_DATA" 2>/dev/null || echo '{}')

MASTER_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$MASTER_TOKEN" ]; then
    measure_time "Master Login" "${API_BASE}/auth/login" "POST" "$LOGIN_DATA" "" > /dev/null
    echo -e "  ${GREEN}✅ Master authentication successful${NC}"
else
    echo -e "  ${RED}❌ Master authentication failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}4. Admin Dashboard Data Load Performance${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$MASTER_TOKEN" ]; then
    measure_time "Get Users (Admin)" "${API_BASE}/users?limit=10" "GET" "" "$MASTER_TOKEN" > /dev/null
    measure_time "Get Settings" "${API_BASE}/settings" "GET" "" "$MASTER_TOKEN" > /dev/null
    measure_time "Get Trading Levels" "${API_BASE}/trading-levels" "GET" "" "$MASTER_TOKEN" > /dev/null
    measure_time "Get Deposit Wallets" "${API_BASE}/deposit-wallets" "GET" "" "$MASTER_TOKEN" > /dev/null
else
    echo -e "  ${YELLOW}⚠️  Skipped (no auth token)${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}5. Real-Time Features Performance${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

measure_time "Chat Messages (No Auth)" "${API_BASE}/chat/messages" "GET" "" "" > /dev/null
measure_time "Chat Active Status" "${API_BASE}/chat/active" "GET" "" "" > /dev/null

if [ -n "$MASTER_TOKEN" ]; then
    measure_time "Admin Activity Logs" "${API_BASE}/admin-activity?limit=10" "GET" "" "$MASTER_TOKEN" > /dev/null
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}6. Network Latency Analysis${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Ping-like test for network latency
echo "  Running 5 quick health checks to measure latency..."
LATENCIES=()
for i in {1..5}; do
    LATENCY=$(measure_time "Health Check #$i" "$API_BASE/../health" "GET" "" "" 2>/dev/null)
    LATENCIES+=($LATENCY)
done

# Calculate average
TOTAL_LATENCY=0
for lat in "${LATENCIES[@]}"; do
    TOTAL_LATENCY=$((TOTAL_LATENCY + lat))
done
AVG_LATENCY=$((TOTAL_LATENCY / 5))

echo -e "  ${BLUE}Average Latency: ${AVG_LATENCY}ms${NC}"

if [ "$AVG_LATENCY" -lt "$THRESHOLD_EXCELLENT" ]; then
    echo -e "  ${GREEN}✅ Network latency is excellent${NC}"
elif [ "$AVG_LATENCY" -lt "$THRESHOLD_GOOD" ]; then
    echo -e "  ${GREEN}✅ Network latency is good${NC}"
elif [ "$AVG_LATENCY" -lt "$THRESHOLD_ACCEPTABLE" ]; then
    echo -e "  ${YELLOW}⚠️  Network latency is acceptable${NC}"
else
    echo -e "  ${RED}❌ Network latency is high${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Performance Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed (Fast): ${GREEN}$PASSED_TESTS${NC}"
echo -e "Warnings (Slow): ${YELLOW}$WARNING_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate success rate
SUCCESS_RATE=$(echo "scale=1; ($PASSED_TESTS + $WARNING_TESTS) * 100 / $TOTAL_TESTS" | bc)

echo -e "Success Rate: ${BLUE}${SUCCESS_RATE}%${NC}"
echo ""

# Performance grade
if [ "$FAILED_TESTS" -eq 0 ] && [ "$WARNING_TESTS" -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🏆 GRADE: A+ (EXCELLENT)         ║${NC}"
    echo -e "${GREEN}║  All systems perform excellently  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
elif [ "$FAILED_TESTS" -eq 0 ] && [ "$WARNING_TESTS" -le 2 ]; then
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🥇 GRADE: A (VERY GOOD)          ║${NC}"
    echo -e "${GREEN}║  Performance is very good         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
elif [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  🥈 GRADE: B (GOOD)               ║${NC}"
    echo -e "${YELLOW}║  Some endpoints are slow          ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════╝${NC}"
elif [ "$FAILED_TESTS" -le 2 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  🥉 GRADE: C (ACCEPTABLE)         ║${NC}"
    echo -e "${YELLOW}║  Consider optimization            ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ GRADE: F (NEEDS IMPROVEMENT)  ║${NC}"
    echo -e "${RED}║  Critical performance issues      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 Performance Thresholds${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}✅ Excellent:${NC} < ${THRESHOLD_EXCELLENT}ms"
echo -e "  ${GREEN}✅ Good:${NC}      < ${THRESHOLD_GOOD}ms"
echo -e "  ${YELLOW}⚠️  Acceptable:${NC} < ${THRESHOLD_ACCEPTABLE}ms"
echo -e "  ${YELLOW}⚠️  Slow:${NC}       < ${THRESHOLD_SLOW}ms"
echo -e "  ${RED}❌ Too Slow:${NC}   > ${THRESHOLD_SLOW}ms"
echo ""

# Key Performance Indicators
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🎯 Key Performance Indicators (KPIs)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ✓ Admin Login Response:  ${GREEN}Target < 2s${NC}"
echo -e "  ✓ Master Login Response: ${GREEN}Target < 2s${NC}"
echo -e "  ✓ Dashboard Data Load:   ${GREEN}Target < 3s${NC}"
echo -e "  ✓ API Health Check:      ${GREEN}Target < 500ms${NC}"
echo -e "  ✓ Real-time Features:    ${GREEN}Target < 1s${NC}"
echo ""

# Recommendations
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}💡 Recommendations${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$FAILED_TESTS" -gt 0 ] || [ "$WARNING_TESTS" -gt 3 ]; then
    echo -e "  ${YELLOW}Performance Optimization Suggestions:${NC}"
    echo -e "  1. Consider upgrading to paid hosting plan (eliminate cold starts)"
    echo -e "  2. Enable database query caching"
    echo -e "  3. Add CDN for static assets"
    echo -e "  4. Optimize database indexes"
    echo -e "  5. Implement API response caching"
    echo -e "  6. Consider database connection pooling"
else
    echo -e "  ${GREEN}✅ Performance is excellent! No immediate optimizations needed.${NC}"
    echo -e "  ${GREEN}✅ Admin and Master accounts respond immediately.${NC}"
    echo -e "  ${GREEN}✅ All systems meet production performance standards.${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Exit code based on failures
if [ "$FAILED_TESTS" -gt 0 ]; then
    exit 1
else
    exit 0
fi
