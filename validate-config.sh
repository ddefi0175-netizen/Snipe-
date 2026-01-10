#!/bin/bash

# Firebase & Database Configuration Validator
# Checks if Firebase credentials and database are properly configured

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🔐 Firebase & Database Configuration Validator             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_count=0
pass_count=0
fail_count=0

# Function to check status
check_item() {
  check_count=$((check_count + 1))
  local name="$1"
  local result="$2"

  if [ "$result" = "PASS" ]; then
    echo -e "${GREEN}✅${NC} $name"
    pass_count=$((pass_count + 1))
  else
    echo -e "${RED}❌${NC} $name"
    fail_count=$((fail_count + 1))
  fi
}

echo -e "${BLUE}📋 FRONTEND CONFIGURATION${NC}"
echo "───────────────────────────────────────────────────────────────"

# Check frontend .env exists
if [ -f "Onchainweb/.env" ]; then
  check_item "Frontend .env file exists" "PASS"

  # Check Firebase API Key
  if grep -q "VITE_FIREBASE_API_KEY=YOUR_" Onchainweb/.env; then
    check_item "Firebase API Key (placeholder detected)" "FAIL"
  elif grep -q "VITE_FIREBASE_API_KEY=" Onchainweb/.env; then
    check_item "Firebase API Key configured" "PASS"
  else
    check_item "Firebase API Key configured" "FAIL"
  fi

  # Check Project ID
  if grep -q "VITE_FIREBASE_PROJECT_ID=your-" Onchainweb/.env; then
    check_item "Firebase Project ID (placeholder detected)" "FAIL"
  elif grep -q "VITE_FIREBASE_PROJECT_ID=" Onchainweb/.env; then
    check_item "Firebase Project ID configured" "PASS"
  else
    check_item "Firebase Project ID configured" "FAIL"
  fi

  # Check Auth Domain
  if grep -q "VITE_FIREBASE_AUTH_DOMAIN=your-" Onchainweb/.env; then
    check_item "Firebase Auth Domain (placeholder detected)" "FAIL"
  elif grep -q "VITE_FIREBASE_AUTH_DOMAIN=" Onchainweb/.env; then
    check_item "Firebase Auth Domain configured" "PASS"
  else
    check_item "Firebase Auth Domain configured" "FAIL"
  fi

else
  check_item "Frontend .env file exists" "FAIL"
fi

echo ""
echo -e "${BLUE}🔑 BACKEND CONFIGURATION${NC}"
echo "───────────────────────────────────────────────────────────────"

# Check backend .env exists
if [ -f "backend/.env" ]; then
  check_item "Backend .env file exists" "PASS"

  # Check JWT Secret
  if grep -q "JWT_SECRET=your-super-secret" backend/.env; then
    check_item "JWT Secret (default placeholder detected)" "FAIL"
  elif grep -q "JWT_SECRET=" backend/.env; then
    check_item "JWT Secret configured" "PASS"
  else
    check_item "JWT Secret configured" "FAIL"
  fi

  # Check Master Username
  if grep -q "MASTER_USERNAME=master" backend/.env; then
    check_item "Master Username (default value - should change)" "FAIL"
  elif grep -q "MASTER_USERNAME=" backend/.env; then
    check_item "Master Username configured" "PASS"
  else
    check_item "Master Username configured" "FAIL"
  fi

  # Check Master Password
  if grep -q "MASTER_PASSWORD=YourSecurePasswordHere" backend/.env; then
    check_item "Master Password (placeholder detected)" "FAIL"
  elif grep -q "MASTER_PASSWORD=" backend/.env; then
    check_item "Master Password configured" "PASS"
  else
    check_item "Master Password configured" "FAIL"
  fi

else
  check_item "Backend .env file exists" "FAIL"
fi

echo ""
echo -e "${BLUE}🔗 DATABASE STATUS${NC}"
echo "───────────────────────────────────────────────────────────────"

# Check .firebaserc
if [ -f ".firebaserc" ]; then
  check_item "Firebase project reference (.firebaserc)" "PASS"
  if grep -q "\"default\": \"your-" .firebaserc; then
    check_item "Firebase project ID set (placeholder detected)" "FAIL"
  elif grep -q "\"default\":" .firebaserc; then
    check_item "Firebase project ID set" "PASS"
  else
    check_item "Firebase project ID set" "FAIL"
  fi
else
  check_item "Firebase project reference (.firebaserc)" "FAIL"
fi

# Check firestore.rules
if [ -f "firestore.rules" ]; then
  check_item "Firestore security rules file" "PASS"
else
  check_item "Firestore security rules file" "FAIL"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "║   📊 SUMMARY: ${GREEN}$pass_count PASS${NC} / ${RED}$fail_count FAIL${NC}"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✅ All configuration checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start backend: cd backend && npm run dev"
  echo "2. Start frontend: cd Onchainweb && npm run dev"
  echo "3. Test wallet connection at http://localhost:5174"
else
  echo -e "${YELLOW}⚠️  Some configuration items need attention${NC}"
  echo ""
  echo "Please:"
  echo "1. Review FIREBASE_DATABASE_SETUP.md for detailed instructions"
  echo "2. Add real Firebase credentials to Onchainweb/.env"
  echo "3. Change placeholder values in backend/.env"
  echo "4. Run this script again to verify"
fi

echo ""
echo "📖 Documentation: cat FIREBASE_DATABASE_SETUP.md"
echo "🔐 For more info: cat Onchainweb/.env (frontend secrets)"
echo "🔑 For more info: cat backend/.env (backend secrets)"
echo ""
