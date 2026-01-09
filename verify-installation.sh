#!/bin/bash

# Snipe Installation Verification Script
# This script verifies that all dependencies are properly installed

echo "=================================================="
echo "   Snipe Installation Verification"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for results
passed=0
failed=0

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        ((failed++))
        return 1
    fi
}

# Function to check directory
check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 NOT found"
        ((failed++))
        return 1
    fi
}

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 NOT found"
        ((failed++))
        return 1
    fi
}

# Check prerequisites
echo "1. Checking Prerequisites..."
echo "-----------------------------------"
check_command node
check_command npm
check_command git
echo ""

# Check Node.js version
echo "2. Checking Node.js Version..."
echo "-----------------------------------"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js version is 18+ (v$(node -v))"
    ((passed++))
else
    echo -e "${RED}✗${NC} Node.js version is too old (need 18+, have $(node -v))"
    ((failed++))
fi
echo ""

# Check backend installation
echo "3. Checking Backend Installation..."
echo "-----------------------------------"
cd backend 2>/dev/null

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend node_modules directory exists"
    ((passed++))
    
    # Count packages
    BACKEND_PACKAGES=$(ls node_modules | wc -l)
    echo -e "${GREEN}✓${NC} Backend has $BACKEND_PACKAGES packages installed"
    ((passed++))
    
    # Check key packages
    for pkg in express mongoose bcryptjs cors jsonwebtoken dotenv; do
        if [ -d "node_modules/$pkg" ]; then
            echo -e "${GREEN}✓${NC} $pkg is installed"
            ((passed++))
        else
            echo -e "${RED}✗${NC} $pkg is NOT installed"
            ((failed++))
        fi
    done
else
    echo -e "${RED}✗${NC} Backend node_modules NOT found - run 'npm install' in backend/"
    ((failed++))
fi

cd .. 2>/dev/null
echo ""

# Check frontend installation
echo "4. Checking Frontend Installation..."
echo "-----------------------------------"
cd Onchainweb 2>/dev/null

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend node_modules directory exists"
    ((passed++))
    
    # Count packages
    FRONTEND_PACKAGES=$(ls node_modules | wc -l)
    echo -e "${GREEN}✓${NC} Frontend has $FRONTEND_PACKAGES packages installed"
    ((passed++))
    
    # Check key packages
    for pkg in react react-dom react-router-dom vite tailwindcss; do
        if [ -d "node_modules/$pkg" ]; then
            echo -e "${GREEN}✓${NC} $pkg is installed"
            ((passed++))
        else
            echo -e "${RED}✗${NC} $pkg is NOT installed"
            ((failed++))
        fi
    done
else
    echo -e "${RED}✗${NC} Frontend node_modules NOT found - run 'npm install' in Onchainweb/"
    ((failed++))
fi

cd .. 2>/dev/null
echo ""

# Check configuration files
echo "5. Checking Configuration Files..."
echo "-----------------------------------"
check_file "backend/.env.example" "Backend .env.example exists"
check_file "Onchainweb/.env.example" "Frontend .env.example exists"
check_file "backend/package.json" "Backend package.json exists"
check_file "Onchainweb/package.json" "Frontend package.json exists"
check_file "README.md" "README.md exists"
check_file "DEPLOYMENT.md" "DEPLOYMENT.md exists"
check_file "PERFORMANCE_OPTIMIZATION_GUIDE.md" "Performance guide exists"
check_file "INSTALLATION_COMPLETE.md" "Installation summary exists"
echo ""

# Check documentation
echo "6. Checking Documentation..."
echo "-----------------------------------"
DOC_COUNT=$(ls -1 *.md 2>/dev/null | wc -l)
echo -e "${GREEN}✓${NC} Found $DOC_COUNT documentation files"
((passed++))
echo ""

# Test backend package imports
echo "7. Testing Backend Package Imports..."
echo "-----------------------------------"
cd backend 2>/dev/null
if node -e "require('express'); require('mongoose'); require('bcryptjs')" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend packages can be imported successfully"
    ((passed++))
else
    echo -e "${RED}✗${NC} Backend packages import failed"
    ((failed++))
fi
cd .. 2>/dev/null
echo ""

# Summary
echo "=================================================="
echo "   Installation Verification Results"
echo "=================================================="
echo ""
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ Installation Complete!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Configure environment variables:"
    echo "   - Copy backend/.env.example to backend/.env"
    echo "   - Copy Onchainweb/.env.example to Onchainweb/.env"
    echo "2. Seed the database: cd backend && node seed.js"
    echo "3. Start backend: cd backend && npm start"
    echo "4. Start frontend: cd Onchainweb && npm run dev"
    echo ""
    echo "For performance improvements, see:"
    echo "   PERFORMANCE_OPTIMIZATION_GUIDE.md"
    exit 0
else
    echo -e "${RED}✗ Installation Incomplete${NC}"
    echo ""
    echo "Please fix the issues above and run this script again."
    echo ""
    echo "Common fixes:"
    echo "  - Run 'npm install' in backend/ directory"
    echo "  - Run 'npm install' in Onchainweb/ directory"
    echo "  - Ensure Node.js 18+ is installed"
    exit 1
fi
