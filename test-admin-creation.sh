#!/bin/bash
# Test script for admin login and creation

API_BASE="${BACKEND_URL:-https://snipe-api.onrender.com}"

echo "=== Testing Admin Login & Creation ==="
echo "API Base: $API_BASE"
echo ""

# Step 1: Master login
echo "1. Master Login..."
MASTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"master","password":"OnchainWeb2025!"}')

echo "Response: $MASTER_RESPONSE"

# Extract token
MASTER_TOKEN=$(echo "$MASTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$MASTER_TOKEN" ]; then
  echo "❌ Master login failed - no token received"
  exit 1
fi
echo "✅ Master token received: ${MASTER_TOKEN:0:20}..."
echo ""

# Step 2: List existing admins
echo "2. List Existing Admins..."
ADMINS_RESPONSE=$(curl -s -X GET "$API_BASE/api/auth/admins" \
  -H "Authorization: Bearer $MASTER_TOKEN")

echo "Admins: $ADMINS_RESPONSE"
echo ""

# Step 3: Create new admin
TIMESTAMP=$(date +%s)
NEW_ADMIN="testadmin_$TIMESTAMP"
echo "3. Creating New Admin: $NEW_ADMIN..."

CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/admin" \
  -H "Authorization: Bearer $MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$NEW_ADMIN\",\"password\":\"TestPass123!\"}")

echo "Create Response: $CREATE_RESPONSE"

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Admin created successfully!"
else
  echo "❌ Admin creation failed"
fi
echo ""

# Step 4: Verify new admin can login
echo "4. Testing New Admin Login..."
ADMIN_LOGIN=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$NEW_ADMIN\",\"password\":\"TestPass123!\"}")

echo "Admin Login Response: $ADMIN_LOGIN"

if echo "$ADMIN_LOGIN" | grep -q '"success":true'; then
  echo "✅ New admin login successful!"
else
  echo "❌ New admin login failed"
fi
echo ""

# Step 5: Delete test admin (cleanup)
echo "5. Cleanup - Deleting test admin..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/api/auth/admin/$NEW_ADMIN" \
  -H "Authorization: Bearer $MASTER_TOKEN")

echo "Delete Response: $DELETE_RESPONSE"
echo ""

echo "=== Test Complete ==="
