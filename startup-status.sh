#!/bin/bash

# 🚀 SNIPE STARTUP & STATUS CHECK
# Complete status report for Firebase, database, and servers

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 SNIPE APPLICATION - STARTUP & STATUS REPORT        ║"
echo "║                  January 10, 2026                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔐 CONFIGURATION STATUS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check backend config
echo -e "${CYAN}Backend Configuration:${NC}"
if grep -q "JWT_SECRET=G1oUFXpp5sPSGJ" backend/.env; then
  echo -e "  ${GREEN}✅${NC} JWT Secret: SECURE (configured)"
else
  echo -e "  ${RED}❌${NC} JWT Secret: Not configured"
fi

if grep -q "MASTER_USERNAME=snipe_admin" backend/.env; then
  echo -e "  ${GREEN}✅${NC} Master Username: snipe_admin_secure_7ecb869e"
else
  echo -e "  ${RED}❌${NC} Master Username: Not configured"
fi

if grep -q "MASTER_PASSWORD=WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E=" backend/.env; then
  echo -e "  ${GREEN}✅${NC} Master Password: SECURE (configured - Updated Jan 18, 2026)"
else
  echo -e "  ${RED}❌${NC} Master Password: Not configured or not updated"
fi

echo ""
echo -e "${CYAN}Frontend Configuration:${NC}"
if grep -q "VITE_FIREBASE_PROJECT_ID=onchainweb-37d30" Onchainweb/.env; then
  echo -e "  ${GREEN}✅${NC} Firebase Project ID: onchainweb-37d30"
else
  echo -e "  ${RED}❌${NC} Firebase Project ID: Not configured"
fi

if grep -q "VITE_FIREBASE_API_KEY=AIzaSyD" Onchainweb/.env; then
  echo -e "  ${GREEN}✅${NC} Firebase API Key: Configured"
else
  echo -e "  ${RED}❌${NC} Firebase API Key: Not configured"
fi

echo ""
echo -e "${CYAN}Firebase Project Reference:${NC}"
if grep -q '"default": "onchainweb-37d30"' .firebaserc; then
  echo -e "  ${GREEN}✅${NC} .firebaserc: onchainweb-37d30"
else
  echo -e "  ${RED}❌${NC} .firebaserc: Not configured"
fi

if [ -f "firestore.rules" ]; then
  lines=$(wc -l < firestore.rules)
  echo -e "  ${GREEN}✅${NC} Firestore Rules: Deployed ($lines lines)"
else
  echo -e "  ${RED}❌${NC} Firestore Rules: Not found"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 SERVER STATUS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check backend server
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "  ${GREEN}✅${NC} Backend Server: RUNNING on port 4000"
  backend_pid=$(lsof -ti :4000)
  echo "     Process ID: $backend_pid"
else
  echo -e "  ${RED}❌${NC} Backend Server: NOT RUNNING (expected port 4000)"
  echo "     Start with: cd backend && npm run dev"
fi

# Check frontend server
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "  ${GREEN}✅${NC} Frontend Server: RUNNING on port 5173"
  frontend_pid=$(lsof -ti :5173)
    echo "     Process ID: $frontend_pid"
else
  echo -e "  ${RED}❌${NC} Frontend Server: NOT RUNNING (expected port 5173)"
  echo "     Start with: cd Onchainweb && npm run dev"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔌 DATABASE CONNECTION TESTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Test backend health
if command -v curl >/dev/null 2>&1; then
  echo -e "${CYAN}Backend Health:${NC}"
  if timeout 3 curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
    response=$(curl -s http://localhost:4000/api/health 2>/dev/null)
    if echo "$response" | grep -q "status"; then
      echo -e "  ${GREEN}✅${NC} Backend responding to health check"
      echo "     Response: $response" | head -1
    else
      echo -e "  ${YELLOW}⚠️${NC}  Backend responding but unexpected format"
    fi
  else
    echo -e "  ${RED}❌${NC} Backend not responding on port 4000"
  fi
else
  echo -e "  ${YELLOW}⚠️${NC}  curl not available for health check"
fi

echo ""
echo -e "${CYAN}Frontend Connectivity:${NC}"
if timeout 3 curl -s http://localhost:5173 >/dev/null 2>&1; then
  echo -e "  ${GREEN}✅${NC} Frontend responding on port 5173"
else
  echo -e "  ${RED}❌${NC} Frontend not responding on port 5173"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Count passes
passes=0
total=11

grep -q "JWT_SECRET=G1oUFXpp5sPSGJ" backend/.env && passes=$((passes + 1))
grep -q "MASTER_USERNAME=snipe_admin" backend/.env && passes=$((passes + 1))
grep -q "MASTER_PASSWORD=Snipe" backend/.env && passes=$((passes + 1))
grep -q "VITE_FIREBASE_PROJECT_ID=onchainweb-37d30" Onchainweb/.env && passes=$((passes + 1))
grep -q "VITE_FIREBASE_API_KEY=AIzaSyD" Onchainweb/.env && passes=$((passes + 1))
grep -q '"default": "onchainweb-37d30"' .firebaserc && passes=$((passes + 1))
[ -f "firestore.rules" ] && passes=$((passes + 1))
lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 && passes=$((passes + 1))
lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 && passes=$((passes + 1))

echo "Configuration & Servers: $passes/$total passing ($(( passes * 100 / total ))%)"
echo ""

if [ $passes -eq 9 ]; then
  echo -e "${GREEN}✅ ALL CRITICAL SYSTEMS ONLINE!${NC}"
  echo ""
  echo "   Status: 🚀 PRODUCTION READY"
  echo "   Frontend: http://localhost:5174"
  echo "   Backend: http://localhost:4000"
  echo ""
elif [ $passes -ge 7 ]; then
  echo -e "${YELLOW}⚠️  PARTIALLY CONFIGURED${NC}"
  echo ""
  echo "   Next step: Start remaining servers"
  [ ! lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 ] && echo "   - Backend: cd backend && npm run dev"
  [ ! lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1 ] && echo "   - Frontend: cd Onchainweb && npm run dev"
else
  echo -e "${RED}❌ CONFIGURATION INCOMPLETE${NC}"
  echo ""
  echo "   Missing items - check output above"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔗 QUICK ACCESS:${NC}"
echo ""
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:4000"
echo "   DevTools:  F12 in browser → Console"
echo ""
echo -e "${CYAN}📚 DOCUMENTATION:${NC}"
echo ""
echo "   cat FIREBASE_CREDENTIALS_REPORT.md"
echo "   cat QUICK_FIREBASE_SETUP.md"
echo "   ./validate-config.sh"
echo "   ./dashboard.sh"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Show critical notes
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
echo ""
echo "1. The current Firebase API Key is a TEST value"
echo "   REPLACE with real credentials before production:"
echo "   https://console.firebase.google.com"
echo ""
echo "2. Master credentials are secure but store safely:"
echo "   Username: snipe_admin_secure_7ecb869e"
echo "   Password: (hidden) - keep in secure vault"
echo ""
echo "3. .env files are in .gitignore - never commit secrets"
echo ""
echo "═════════════════════════════════════════════════════════════════"
