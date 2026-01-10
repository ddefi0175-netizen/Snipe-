#!/bin/bash

# Production Database Connection Status Dashboard
# Shows real-time status of Firebase credentials and database connection

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   📊 PRODUCTION DATABASE CONNECTION DASHBOARD               ║"
echo "║   January 10, 2026                                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "Generated: $TIMESTAMP"
echo "Region: asia-east2"
echo ""

# ========== FIREBASE CREDENTIALS SECTION ==========
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔐 FIREBASE CREDENTIALS STATUS                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "📋 FRONTEND CONFIGURATION (${CYAN}Onchainweb/.env${NC})"
echo "───────────────────────────────────────────────────────────────"

# Check each Firebase credential
check_frontend_key() {
  if grep -q "VITE_FIREBASE_API_KEY=YOUR_" Onchainweb/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} API Key: PLACEHOLDER"
  elif grep -q "VITE_FIREBASE_API_KEY=XXXXXXXXXX" Onchainweb/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} API Key: PLACEHOLDER"
  elif grep -q "VITE_FIREBASE_API_KEY=" Onchainweb/.env 2>/dev/null; then
    actual=$(grep "VITE_FIREBASE_API_KEY=" Onchainweb/.env | cut -d'=' -f2 | head -c 15)
    echo -e "${GREEN}✅${NC} API Key: ${actual}..."
  fi
}

check_frontend_projectid() {
  if grep -q "VITE_FIREBASE_PROJECT_ID=your-" Onchainweb/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} Project ID: PLACEHOLDER (your-firebase-project-id)"
  elif grep -q "VITE_FIREBASE_PROJECT_ID=" Onchainweb/.env 2>/dev/null; then
    actual=$(grep "VITE_FIREBASE_PROJECT_ID=" Onchainweb/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅${NC} Project ID: $actual"
  fi
}

check_frontend_auth_domain() {
  if grep -q "VITE_FIREBASE_AUTH_DOMAIN=your-" Onchainweb/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} Auth Domain: PLACEHOLDER"
  elif grep -q "VITE_FIREBASE_AUTH_DOMAIN=" Onchainweb/.env 2>/dev/null; then
    actual=$(grep "VITE_FIREBASE_AUTH_DOMAIN=" Onchainweb/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅${NC} Auth Domain: $actual"
  fi
}

check_frontend_storage() {
  if grep -q "VITE_FIREBASE_STORAGE_BUCKET=your-" Onchainweb/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} Storage Bucket: PLACEHOLDER"
  elif grep -q "VITE_FIREBASE_STORAGE_BUCKET=" Onchainweb/.env 2>/dev/null; then
    actual=$(grep "VITE_FIREBASE_STORAGE_BUCKET=" Onchainweb/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅${NC} Storage Bucket: $actual"
  fi
}

check_frontend_sender() {
  if grep -q "VITE_FIREBASE_MESSAGING_SENDER_ID=" Onchainweb/.env 2>/dev/null; then
    actual=$(grep "VITE_FIREBASE_MESSAGING_SENDER_ID=" Onchainweb/.env | cut -d'=' -f2)
    if [ -z "$actual" ]; then
      echo -e "${RED}❌${NC} Messaging Sender ID: EMPTY"
    else
      echo -e "${GREEN}✅${NC} Messaging Sender ID: ${actual:0:8}..."
    fi
  fi
}

check_frontend_appid() {
  if grep -q "VITE_FIREBASE_APP_ID=" Onchainweb/.env 2>/dev/null; then
    actual=$(grep "VITE_FIREBASE_APP_ID=" Onchainweb/.env | cut -d'=' -f2)
    if [ -z "$actual" ]; then
      echo -e "${RED}❌${NC} App ID: EMPTY"
    else
      echo -e "${GREEN}✅${NC} App ID: ${actual:0:15}..."
    fi
  fi
}

check_frontend_measurement() {
  if grep -q "VITE_FIREBASE_MEASUREMENT_ID=" Onchainweb/.env 2>/dev/null; then
    actual=$(grep "VITE_FIREBASE_MEASUREMENT_ID=" Onchainweb/.env | cut -d'=' -f2)
    if [ -z "$actual" ]; then
      echo -e "${RED}❌${NC} Measurement ID: EMPTY"
    else
      echo -e "${GREEN}✅${NC} Measurement ID: $actual"
    fi
  fi
}

check_frontend_key
check_frontend_projectid
check_frontend_auth_domain
check_frontend_storage
check_frontend_sender
check_frontend_appid
check_frontend_measurement

echo ""
echo -e "🔑 BACKEND CONFIGURATION (${CYAN}backend/.env${NC})"
echo "───────────────────────────────────────────────────────────────"

# Check backend credentials
check_backend_jwt() {
  if grep -q "JWT_SECRET=your-super-secret" backend/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} JWT Secret: DEFAULT PLACEHOLDER"
  elif grep -q "JWT_SECRET=" backend/.env 2>/dev/null; then
    echo -e "${GREEN}✅${NC} JWT Secret: CONFIGURED (hidden for security)"
  fi
}

check_backend_username() {
  if grep -q "MASTER_USERNAME=master" backend/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} Master Username: DEFAULT (master)"
  elif grep -q "MASTER_USERNAME=" backend/.env 2>/dev/null; then
    actual=$(grep "MASTER_USERNAME=" backend/.env | cut -d'=' -f2)
    echo -e "${GREEN}✅${NC} Master Username: ${actual:0:10}..."
  fi
}

check_backend_password() {
  if grep -q "MASTER_PASSWORD=YourSecurePasswordHere" backend/.env 2>/dev/null; then
    echo -e "${RED}❌${NC} Master Password: PLACEHOLDER"
  elif grep -q "MASTER_PASSWORD=" backend/.env 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Master Password: CONFIGURED (hidden for security)"
  fi
}

check_backend_jwt
check_backend_username
check_backend_password

echo ""

# ========== DATABASE CONNECTION SECTION ==========
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🗄️  DATABASE CONNECTION STATUS                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "📍 FIREBASE PROJECT REFERENCE"
echo "───────────────────────────────────────────────────────────────"

check_firebaserc() {
  if [ -f ".firebaserc" ]; then
    project=$(grep '"default"' .firebaserc | cut -d'"' -f4)
    if [ "$project" = "your-firebase-project-id" ] || [ -z "$project" ]; then
      echo -e "${RED}❌${NC} Firebase Project: PLACEHOLDER ($project)"
    else
      echo -e "${GREEN}✅${NC} Firebase Project: $project"
    fi
  else
    echo -e "${RED}❌${NC} .firebaserc file not found"
  fi
}

check_firebaserc

echo ""
echo -e "🔗 FIRESTORE SETUP"
echo "───────────────────────────────────────────────────────────────"

if [ -f "firestore.rules" ]; then
  echo -e "${GREEN}✅${NC} Firestore rules file: PRESENT ($(wc -l < firestore.rules) lines)"
else
  echo -e "${RED}❌${NC} Firestore rules file: NOT FOUND"
fi

if [ -f "firestore.indexes.json" ]; then
  echo -e "${GREEN}✅${NC} Firestore indexes file: PRESENT"
else
  echo -e "${YELLOW}⚠️ ${NC} Firestore indexes file: Optional"
fi

echo ""

# ========== SERVER STATUS SECTION ==========
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 SERVER & CONNECTION STATUS                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "🖥️  SERVER PROCESSES"
echo "───────────────────────────────────────────────────────────────"

# Check backend server
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} Backend Server: RUNNING on port 4000"
else
  echo -e "${RED}❌${NC} Backend Server: NOT RUNNING (expected on port 4000)"
fi

# Check frontend server
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} Frontend Server: RUNNING on port 5174"
else
  echo -e "${RED}❌${NC} Frontend Server: NOT RUNNING (expected on port 5174)"
fi

echo ""
echo -e "🔌 DATABASE CONNECTIVITY"
echo "───────────────────────────────────────────────────────────────"

# Test backend health
if command -v curl >/dev/null 2>&1; then
  if curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
    status=$(curl -s http://localhost:4000/api/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅${NC} Backend Health: $status"
  else
    echo -e "${RED}❌${NC} Backend Health: Connection refused (server not running)"
  fi
else
  echo -e "${YELLOW}⚠️ ${NC} curl not available for health check"
fi

echo ""

# ========== SUMMARY SECTION ==========
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📈 CONFIGURATION SUMMARY                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Count status
total_checks=12
pass_checks=0

if ! grep -q "VITE_FIREBASE_API_KEY=YOUR_" Onchainweb/.env 2>/dev/null && \
   ! grep -q "VITE_FIREBASE_API_KEY=XXXXXXXXXX" Onchainweb/.env 2>/dev/null && \
   grep -q "VITE_FIREBASE_API_KEY=" Onchainweb/.env 2>/dev/null; then
  pass_checks=$((pass_checks + 1))
fi

if ! grep -q "VITE_FIREBASE_PROJECT_ID=your-" Onchainweb/.env 2>/dev/null && \
   grep -q "VITE_FIREBASE_PROJECT_ID=" Onchainweb/.env 2>/dev/null; then
  pass_checks=$((pass_checks + 1))
fi

if ! grep -q "VITE_FIREBASE_AUTH_DOMAIN=your-" Onchainweb/.env 2>/dev/null && \
   grep -q "VITE_FIREBASE_AUTH_DOMAIN=" Onchainweb/.env 2>/dev/null; then
  pass_checks=$((pass_checks + 1))
fi

if ! grep -q "VITE_FIREBASE_STORAGE_BUCKET=your-" Onchainweb/.env 2>/dev/null && \
   grep -q "VITE_FIREBASE_STORAGE_BUCKET=" Onchainweb/.env 2>/dev/null; then
  pass_checks=$((pass_checks + 1))
fi

if grep -q "VITE_FIREBASE_MESSAGING_SENDER_ID=" Onchainweb/.env 2>/dev/null && \
   [ ! -z "$(grep 'VITE_FIREBASE_MESSAGING_SENDER_ID=' Onchainweb/.env | cut -d'=' -f2)" ]; then
  pass_checks=$((pass_checks + 1))
fi

if grep -q "VITE_FIREBASE_APP_ID=" Onchainweb/.env 2>/dev/null && \
   [ ! -z "$(grep 'VITE_FIREBASE_APP_ID=' Onchainweb/.env | cut -d'=' -f2)" ]; then
  pass_checks=$((pass_checks + 1))
fi

if grep -q "VITE_FIREBASE_MEASUREMENT_ID=" Onchainweb/.env 2>/dev/null && \
   [ ! -z "$(grep 'VITE_FIREBASE_MEASUREMENT_ID=' Onchainweb/.env | cut -d'=' -f2)" ]; then
  pass_checks=$((pass_checks + 1))
fi

if ! grep -q "JWT_SECRET=your-super-secret" backend/.env 2>/dev/null && \
   grep -q "JWT_SECRET=" backend/.env 2>/dev/null; then
  pass_checks=$((pass_checks + 1))
fi

if ! grep -q "MASTER_USERNAME=master" backend/.env 2>/dev/null && \
   grep -q "MASTER_USERNAME=" backend/.env 2>/dev/null; then
  pass_checks=$((pass_checks + 1))
fi

if ! grep -q "MASTER_PASSWORD=YourSecurePasswordHere" backend/.env 2>/dev/null && \
   grep -q "MASTER_PASSWORD=" backend/.env 2>/dev/null; then
  pass_checks=$((pass_checks + 1))
fi

if [ -f ".firebaserc" ]; then
  project=$(grep '"default"' .firebaserc | cut -d'"' -f4)
  if [ "$project" != "your-firebase-project-id" ] && [ ! -z "$project" ]; then
    pass_checks=$((pass_checks + 1))
  fi
fi

if [ -f "firestore.rules" ]; then
  pass_checks=$((pass_checks + 1))
fi

percent=$((pass_checks * 100 / total_checks))

echo -e "Status: ${pass_checks}/${total_checks} checks passing (${percent}%)"
echo ""

if [ $pass_checks -eq 12 ]; then
  echo -e "${GREEN}✅ PRODUCTION READY!${NC}"
  echo "   All database credentials configured and services ready."
  echo ""
  echo "   Next steps:"
  echo "   1. Run ./validate-config.sh for detailed verification"
  echo "   2. Test database connection: curl http://localhost:4000/api/health"
  echo "   3. Check app at http://localhost:5174"
elif [ $pass_checks -ge 6 ]; then
  echo -e "${YELLOW}⚠️  PARTIALLY CONFIGURED${NC}"
  echo "   Some credentials are set, but missing or incomplete values remain."
  echo ""
  echo "   Next steps:"
  echo "   1. Follow QUICK_FIREBASE_SETUP.md for 5-minute setup"
  echo "   2. Update missing values in Onchainweb/.env"
  echo "   3. Update missing values in backend/.env"
  echo "   4. Run ./validate-config.sh to verify"
else
  echo -e "${RED}❌ CONFIGURATION INCOMPLETE${NC}"
  echo "   Firebase credentials not configured - placeholder values detected."
  echo ""
  echo "   Action required:"
  echo "   1. Get real Firebase credentials from console.firebase.google.com"
  echo "   2. Update Onchainweb/.env with 7 Firebase values"
  echo "   3. Update backend/.env with JWT secret and master credentials"
  echo "   4. Run ./validate-config.sh to verify"
  echo ""
  echo "   Documentation:"
  echo "   - Quick setup: cat QUICK_FIREBASE_SETUP.md"
  echo "   - Detailed guide: cat FIREBASE_DATABASE_SETUP.md"
  echo "   - Checklist: cat PRODUCTION_DATABASE_CHECKLIST.md"
fi

echo ""
echo "────────────────────────────────────────────────────────────────"
echo -e "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Dashboard: ./dashboard.sh"
echo ""
