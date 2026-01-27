#!/bin/bash
# Test script to verify master account setup guide completeness

echo "🧪 Testing Master Account Setup Guide Completeness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

# Test 1: Check if documentation files exist
echo "Test 1: Documentation Files"
echo "──────────────────────────────"

files=(
    "MASTER_PASSWORD_SETUP_GUIDE.md"
    "MASTER_ACCOUNT_SETUP_QUICK_REFERENCE.md"
    "MASTER_ACCOUNT_SETUP.md"
    "ADMIN_SYSTEM_SETUP_GUIDE.md"
    "HOW_TO_CREATE_ADMIN_CREDENTIALS.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
        ((pass_count++))
    else
        echo -e "${RED}✗${NC} $file missing"
        ((fail_count++))
    fi
done

echo ""

# Test 2: Check if setup script exists and is executable
echo "Test 2: Setup Script"
echo "──────────────────────────────"

if [ -f "setup-master-account-secure.sh" ]; then
    echo -e "${GREEN}✓${NC} setup-master-account-secure.sh exists"
    ((pass_count++))
    
    if [ -x "setup-master-account-secure.sh" ]; then
        echo -e "${GREEN}✓${NC} Script is executable"
        ((pass_count++))
    else
        echo -e "${RED}✗${NC} Script is not executable"
        ((fail_count++))
    fi
else
    echo -e "${RED}✗${NC} setup-master-account-secure.sh missing"
    ((fail_count++))
fi

echo ""

# Test 3: Check environment configuration
echo "Test 3: Environment Configuration"
echo "──────────────────────────────"

if [ -f "Onchainweb/.env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example exists"
    ((pass_count++))
    
    # Check for admin configuration
    if grep -q "VITE_ENABLE_ADMIN" Onchainweb/.env.example; then
        echo -e "${GREEN}✓${NC} VITE_ENABLE_ADMIN in .env.example"
        ((pass_count++))
    else
        echo -e "${RED}✗${NC} VITE_ENABLE_ADMIN missing"
        ((fail_count++))
    fi
    
    if grep -q "VITE_ADMIN_ALLOWLIST" Onchainweb/.env.example; then
        echo -e "${GREEN}✓${NC} VITE_ADMIN_ALLOWLIST in .env.example"
        ((pass_count++))
    else
        echo -e "${RED}✗${NC} VITE_ADMIN_ALLOWLIST missing"
        ((fail_count++))
    fi
else
    echo -e "${RED}✗${NC} .env.example missing"
    ((fail_count++))
fi

echo ""

# Test 4: Check admin authentication implementation
echo "Test 4: Admin Authentication Implementation"
echo "──────────────────────────────"

if [ -f "Onchainweb/src/lib/adminAuth.js" ]; then
    echo -e "${GREEN}✓${NC} adminAuth.js exists"
    ((pass_count++))
    
    # Check for key functions
    functions=(
        "convertToAdminEmail"
        "determineAdminRole"
        "handleAdminLogin"
        "formatFirebaseAuthError"
    )
    
    for func in "${functions[@]}"; do
        if grep -q "$func" Onchainweb/src/lib/adminAuth.js; then
            echo -e "${GREEN}✓${NC} Function $func exists"
            ((pass_count++))
        else
            echo -e "${RED}✗${NC} Function $func missing"
            ((fail_count++))
        fi
    done
else
    echo -e "${RED}✗${NC} adminAuth.js missing"
    ((fail_count++))
fi

echo ""

# Test 5: Check README links
echo "Test 5: README Links"
echo "──────────────────────────────"

if [ -f "README.md" ]; then
    echo -e "${GREEN}✓${NC} README.md exists"
    ((pass_count++))
    
    if grep -q "MASTER_PASSWORD_SETUP_GUIDE.md" README.md; then
        echo -e "${GREEN}✓${NC} Link to setup guide in README"
        ((pass_count++))
    else
        echo -e "${YELLOW}⚠${NC} Link to setup guide not in README"
        ((fail_count++))
    fi
else
    echo -e "${RED}✗${NC} README.md missing"
    ((fail_count++))
fi

echo ""

# Test 6: Test script functionality (non-interactive)
echo "Test 6: Script Functionality"
echo "──────────────────────────────"

if [ -x "setup-master-account-secure.sh" ]; then
    # Test script with automatic 'no' response
    output=$(echo "n" | ./setup-master-account-secure.sh 2>&1)
    
    if echo "$output" | grep -q "Master Account Setup"; then
        echo -e "${GREEN}✓${NC} Script displays title"
        ((pass_count++))
    else
        echo -e "${RED}✗${NC} Script title missing"
        ((fail_count++))
    fi
    
    if echo "$output" | grep -q "Secure Password"; then
        echo -e "${GREEN}✓${NC} Script generates secure password"
        ((pass_count++))
    else
        echo -e "${RED}✗${NC} Password generation failed"
        ((fail_count++))
    fi
fi

echo ""

# Final Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Master account setup is complete.${NC}"
    echo ""
    echo "📚 Documentation available:"
    echo "  • MASTER_PASSWORD_SETUP_GUIDE.md (detailed guide)"
    echo "  • MASTER_ACCOUNT_SETUP_QUICK_REFERENCE.md (quick reference)"
    echo ""
    echo "🚀 To setup master account, run:"
    echo "  ./setup-master-account-secure.sh"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
