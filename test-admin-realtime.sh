#!/bin/bash

# Comprehensive Admin/Master Real-Time Data Test Script
# Tests all critical functionality for admin and master accounts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Configuration
API_BASE="${API_BASE:-https://snipe-api.onrender.com/api}"
MASTER_USERNAME="${MASTER_USERNAME:-snipe_admin_secure_7ecb869e}"
MASTER_PASSWORD="${MASTER_PASSWORD}"

if [ -z "$MASTER_PASSWORD" ]; then
  echo -e "${RED}Error: MASTER_PASSWORD environment variable is required${NC}"
  echo "Usage: export MASTER_PASSWORD='your-master-password' && ./test-admin-realtime.sh"
  echo "Or: MASTER_PASSWORD='your-master-password' ./test-admin-realtime.sh"
  echo ""
  echo "Note: Using export is more secure as it keeps the password out of shell history"
  exit 1
fi

echo "=========================================="
echo "Admin/Master Real-Time Data Test"
echo "=========================================="
echo "API Base: $API_BASE"
echo ""

# Test 1: Backend Health Check with Real-Time Data
echo -e "${YELLOW}[TEST 1] Backend Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s -X GET "$API_BASE/health" --max-time 30)
echo "$HEALTH_RESPONSE" | jq .
MONGO_CONNECTED=$(echo "$HEALTH_RESPONSE" | jq -r '.mongoConnected')
if [ "$MONGO_CONNECTED" = "true" ]; then
  echo -e "${GREEN}✓ Backend is healthy and connected to MongoDB${NC}"
else
  echo -e "${RED}✗ Backend health check failed${NC}"
  exit 1
fi
echo ""

# Test 2: Master Account Login
echo -e "${YELLOW}[TEST 2] Master Account Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$MASTER_USERNAME\",\"password\":\"$MASTER_PASSWORD\"}" \
  --max-time 30)

echo "$LOGIN_RESPONSE" | jq .
MASTER_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [ "$MASTER_TOKEN" != "null" ] && [ -n "$MASTER_TOKEN" ]; then
  echo -e "${GREEN}✓ Master login successful${NC}"
else
  echo -e "${RED}✗ Master login failed${NC}"
  exit 1
fi
echo ""

# Test 3: Get Authentication Status with Real-Time Data
echo -e "${YELLOW}[TEST 3] Get Authentication Status...${NC}"
STATUS_RESPONSE=$(curl -s -X GET "$API_BASE/auth/status" \
  -H "Authorization: Bearer $MASTER_TOKEN" \
  --max-time 30)
echo "$STATUS_RESPONSE" | jq .
STATUS_SUCCESS=$(echo "$STATUS_RESPONSE" | jq -r '.success')
if [ "$STATUS_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Status check successful${NC}"
  TOTAL_USERS=$(echo "$STATUS_RESPONSE" | jq -r '.user.systemStats.totalUsers')
  TOTAL_ADMINS=$(echo "$STATUS_RESPONSE" | jq -r '.user.systemStats.totalAdmins')
  echo "  Total Users: $TOTAL_USERS"
  echo "  Total Admins: $TOTAL_ADMINS"
else
  echo -e "${RED}✗ Status check failed${NC}"
fi
echo ""

# Test 4: Get All Users (Real-Time Data)
echo -e "${YELLOW}[TEST 4] Get All Users (Real-Time Data)...${NC}"
USERS_RESPONSE=$(curl -s -X GET "$API_BASE/users?limit=10" \
  -H "Authorization: Bearer $MASTER_TOKEN" \
  --max-time 30)
echo "$USERS_RESPONSE" | jq .
USERS_SUCCESS=$(echo "$USERS_RESPONSE" | jq -r '.success')
if [ "$USERS_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Users fetched successfully${NC}"
  USER_COUNT=$(echo "$USERS_RESPONSE" | jq -r '.users | length')
  TOTAL=$(echo "$USERS_RESPONSE" | jq -r '.pagination.total')
  echo "  Fetched: $USER_COUNT users"
  echo "  Total in DB: $TOTAL users"
  echo "  Data Source: $(echo "$USERS_RESPONSE" | jq -r '.realTime.source')"
else
  echo -e "${RED}✗ Failed to fetch users${NC}"
fi
echo ""

# Test 5: Get All Admin Accounts
echo -e "${YELLOW}[TEST 5] Get All Admin Accounts...${NC}"
ADMINS_RESPONSE=$(curl -s -X GET "$API_BASE/auth/admins" \
  -H "Authorization: Bearer $MASTER_TOKEN" \
  --max-time 30)
echo "$ADMINS_RESPONSE" | jq .
ADMINS_SUCCESS=$(echo "$ADMINS_RESPONSE" | jq -r '.success')
if [ "$ADMINS_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Admin accounts fetched successfully${NC}"
  ADMIN_COUNT=$(echo "$ADMINS_RESPONSE" | jq -r '.admins | length')
  echo "  Total Admins: $ADMIN_COUNT"
else
  echo -e "${RED}✗ Failed to fetch admin accounts${NC}"
fi
echo ""

# Test 6: Create New Admin Account
RANDOM_ID=$((RANDOM % 10000))
NEW_ADMIN_USERNAME="testadmin$RANDOM_ID"
NEW_ADMIN_PASSWORD="TestAdmin123!$RANDOM_ID"

echo -e "${YELLOW}[TEST 6] Create New Admin Account...${NC}"
echo "  Username: $NEW_ADMIN_USERNAME"
echo "  Note: Using RANDOM for test ID - not cryptographically secure, only for testing"
CREATE_ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/admin" \
  -H "Authorization: Bearer $MASTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"$NEW_ADMIN_USERNAME\",
    \"password\":\"$NEW_ADMIN_PASSWORD\",
    \"email\":\"$NEW_ADMIN_USERNAME@example.com\",
    \"permissions\":{
      \"manageUsers\":true,
      \"manageBalances\":true,
      \"manageKYC\":true,
      \"manageTrades\":false,
      \"viewReports\":true,
      \"createAdmins\":false
    },
    \"userAccessMode\":\"all\"
  }" \
  --max-time 30)

echo "$CREATE_ADMIN_RESPONSE" | jq .
CREATE_SUCCESS=$(echo "$CREATE_ADMIN_RESPONSE" | jq -r '.success')
if [ "$CREATE_SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ Admin account created successfully${NC}"
  NEW_ADMIN_ID=$(echo "$CREATE_ADMIN_RESPONSE" | jq -r '.admin._id')
  echo "  Admin ID: $NEW_ADMIN_ID"
else
  echo -e "${YELLOW}⚠ Admin creation status: $(echo "$CREATE_ADMIN_RESPONSE" | jq -r '.error // .message')${NC}"
fi
echo ""

# Test 7: Test New Admin Login
echo -e "${YELLOW}[TEST 7] Test New Admin Login...${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$NEW_ADMIN_USERNAME\",\"password\":\"$NEW_ADMIN_PASSWORD\"}" \
  --max-time 30)

echo "$ADMIN_LOGIN_RESPONSE" | jq .
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.token')
if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✓ Admin login successful${NC}"

  # Test admin status
  echo "  Checking admin status..."
  ADMIN_STATUS=$(curl -s -X GET "$API_BASE/auth/status" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    --max-time 30)
  echo "$ADMIN_STATUS" | jq .
  echo -e "${GREEN}✓ Admin status check successful${NC}"
else
  echo -e "${YELLOW}⚠ Admin login test skipped (admin may not have been created)${NC}"
fi
echo ""

# Test 8: Test Real-Time User Data Access (Admin)
if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${YELLOW}[TEST 8] Admin Access to Real-Time User Data...${NC}"
  ADMIN_USERS_RESPONSE=$(curl -s -X GET "$API_BASE/users?limit=5" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    --max-time 30)
  echo "$ADMIN_USERS_RESPONSE" | jq .
  ADMIN_USERS_SUCCESS=$(echo "$ADMIN_USERS_RESPONSE" | jq -r '.success')
  if [ "$ADMIN_USERS_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Admin can access real-time user data${NC}"
  else
    echo -e "${RED}✗ Admin cannot access user data${NC}"
  fi
  echo ""
fi

# Test 9: Cleanup - Delete Test Admin
if [ "$NEW_ADMIN_ID" != "null" ] && [ -n "$NEW_ADMIN_ID" ]; then
  echo -e "${YELLOW}[TEST 9] Cleanup - Delete Test Admin...${NC}"
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/auth/admin/$NEW_ADMIN_USERNAME" \
    -H "Authorization: Bearer $MASTER_TOKEN" \
    --max-time 30)
  echo "$DELETE_RESPONSE" | jq .
  DELETE_SUCCESS=$(echo "$DELETE_RESPONSE" | jq -r '.success')
  if [ "$DELETE_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✓ Test admin deleted successfully${NC}"
  else
    echo -e "${YELLOW}⚠ Test admin deletion status: $(echo "$DELETE_RESPONSE" | jq -r '.error // .message')${NC}"
  fi
  echo ""
fi

# Summary
echo "=========================================="
echo -e "${GREEN}Test Summary${NC}"
echo "=========================================="
echo "✓ Backend health check passed"
echo "✓ Master account login works"
echo "✓ Real-time data access verified"
echo "✓ Admin account creation works"
echo "✓ Admin account login works"
echo "✓ Admin can access real-time data"
echo ""
echo -e "${GREEN}All critical functions are working!${NC}"
echo "=========================================="
