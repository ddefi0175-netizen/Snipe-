#!/bin/bash
# Post-deployment smoke tests

PROD_URL="${1:-https://www.onchainweb.app}"

echo "🧪 Post-Deployment Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: $PROD_URL"
echo ""

PASSED=0
FAILED=0

# Test 1: Homepage loads
echo -n "1. Homepage loads (200 OK)... "
if curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" | grep -q "200"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 2: Assets load
echo -n "2. Static assets present... "
INDEX=$(curl -s "$PROD_URL")
if echo "$INDEX" | grep -q "assets"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 3: No console errors in HTML
echo -n "3. No critical errors in HTML... "
if ! echo "$INDEX" | grep -qi "error\|exception"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "⚠️  WARN"
fi

# Test 4: Firebase config present
echo -n "4. Firebase configuration loaded... "
if echo "$INDEX" | grep -q "firebase"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 5: Admin routes accessible
echo -n "5. /master-admin route exists... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/master-admin")
if [ "$STATUS" == "200" ]; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL (Status: $STATUS)"
    ((FAILED++))
fi

# Test 6: Admin route exists
echo -n "6. /admin route exists... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/admin")
if [ "$STATUS" == "200" ]; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL (Status: $STATUS)"
    ((FAILED++))
fi

# Test 7: Wallet connection page
echo -n "7. Main app loads... "
if echo "$INDEX" | grep -qi "wallet\|connect"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "⚠️  WARN"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: $PASSED passed, $FAILED failed"

if [ $FAILED -gt 0 ]; then
    echo "❌ Some tests failed - review deployment"
    exit 1
else
    echo "✅ All critical tests passed!"
fi
