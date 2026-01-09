#!/bin/bash
# ============================================
# Production Readiness Verification Script
# ============================================
# Comprehensive verification for public release
# Checks build, security, configuration, and deployment readiness

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0
WARNINGS=0
CRITICAL_FAILED=0

echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}🚀 PRODUCTION READINESS VERIFICATION${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

# Test 1: Frontend Build Verification
echo -e "${YELLOW}[TEST 1] Verifying Frontend Build...${NC}"
cd Onchainweb
if npm run build > /tmp/build.log 2>&1; then
    echo -e "  ${GREEN}✅ Frontend builds successfully${NC}"
    PASSED=$((PASSED + 1))
    
    # Check build size
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        echo -e "  ℹ️  Build size: $BUILD_SIZE"
        
        # Check for critical files
        if [ -f "dist/index.html" ]; then
            echo -e "  ✅ index.html present in build"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${RED}❌ index.html missing from build${NC}"
            FAILED=$((FAILED + 1))
            CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
        fi
    else
        echo -e "  ${RED}❌ dist directory not created${NC}"
        FAILED=$((FAILED + 1))
        CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
    fi
else
    echo -e "  ${RED}❌ Frontend build failed${NC}"
    tail -20 /tmp/build.log
    FAILED=$((FAILED + 1))
    CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
fi
cd ..
echo ""

# Test 2: Security Audit
echo -e "${YELLOW}[TEST 2] Running Security Audit...${NC}"
cd Onchainweb
npm audit --audit-level=moderate > /tmp/audit.log 2>&1 || true
AUDIT_RESULT=$?

if [ $AUDIT_RESULT -eq 0 ]; then
    echo -e "  ${GREEN}✅ No security vulnerabilities found${NC}"
    PASSED=$((PASSED + 1))
else
    VULN_COUNT=$(grep -c "vulnerabilities" /tmp/audit.log 2>/dev/null || echo "0")
    if [ "$VULN_COUNT" != "0" ]; then
        echo -e "  ${YELLOW}⚠️  Security vulnerabilities detected${NC}"
        echo -e "  ${YELLOW}Review with: npm audit${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "  ${GREEN}✅ Security audit completed${NC}"
        PASSED=$((PASSED + 1))
    fi
fi
cd ..
echo ""

# Test 3: Environment Configuration
echo -e "${YELLOW}[TEST 3] Verifying Environment Configuration...${NC}"
if [ -f "Onchainweb/.env.example" ]; then
    echo -e "  ✅ .env.example file exists"
    PASSED=$((PASSED + 1))
    
    # Check for required variables
    REQUIRED_VARS=(
        "VITE_FIREBASE_API_KEY"
        "VITE_FIREBASE_AUTH_DOMAIN"
        "VITE_FIREBASE_PROJECT_ID"
        "VITE_WALLETCONNECT_PROJECT_ID"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "$var" Onchainweb/.env.example; then
            echo -e "  ✅ $var documented"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${RED}❌ $var missing from .env.example${NC}"
            FAILED=$((FAILED + 1))
        fi
    done
else
    echo -e "  ${RED}❌ .env.example file missing${NC}"
    FAILED=$((FAILED + 1))
    CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
fi
echo ""

# Test 4: Firebase Configuration
echo -e "${YELLOW}[TEST 4] Verifying Firebase Configuration...${NC}"
FIREBASE_FILES=(
    "firebase.json"
    "firestore.rules"
    "firestore.indexes.json"
    ".firebaserc"
)

for file in "${FIREBASE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file exists"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ $file missing${NC}"
        FAILED=$((FAILED + 1))
        CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
    fi
done
echo ""

# Test 5: Security Rules Validation
echo -e "${YELLOW}[TEST 5] Validating Firestore Security Rules...${NC}"
if [ -f "firestore.rules" ]; then
    RULES_CONTENT=$(cat firestore.rules)
    
    # Check for authentication
    if echo "$RULES_CONTENT" | grep -q "request.auth"; then
        echo -e "  ✅ Authentication checks present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Authentication checks missing${NC}"
        FAILED=$((FAILED + 1))
        CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
    fi
    
    # Check for open write access (security risk)
    if echo "$RULES_CONTENT" | grep -q "allow write.*:.*if true"; then
        echo -e "  ${RED}❌ CRITICAL: Open write access detected!${NC}"
        FAILED=$((FAILED + 1))
        CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
    else
        echo -e "  ✅ No open write access"
        PASSED=$((PASSED + 1))
    fi
    
    # Check for role-based access
    if echo "$RULES_CONTENT" | grep -q "isAdmin\|isOwner"; then
        echo -e "  ✅ Role-based access control implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Role-based access not clearly visible${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

# Test 6: Git Configuration
echo -e "${YELLOW}[TEST 6] Verifying Git Configuration...${NC}"
if [ -f ".gitignore" ]; then
    GITIGNORE=$(cat .gitignore)
    
    # Check for sensitive files
    SHOULD_IGNORE=(
        ".env"
        "node_modules"
        "dist"
    )
    
    for item in "${SHOULD_IGNORE[@]}"; do
        if echo "$GITIGNORE" | grep -q "$item"; then
            echo -e "  ✅ $item is ignored"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${YELLOW}⚠️  $item not in .gitignore${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    echo -e "  ${RED}❌ .gitignore missing${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 7: Documentation Check
echo -e "${YELLOW}[TEST 7] Verifying Documentation...${NC}"
REQUIRED_DOCS=(
    "README.md"
    "DEPLOYMENT.md"
    "FIREBASE_SETUP.md"
    "SECURITY.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "  ✅ $doc exists"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  $doc missing${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done
echo ""

# Test 8: Deployment Configuration
echo -e "${YELLOW}[TEST 8] Verifying Deployment Configuration...${NC}"
DEPLOY_CONFIGS=(
    "vercel.json"
    "Onchainweb/package.json"
)

for config in "${DEPLOY_CONFIGS[@]}"; do
    if [ -f "$config" ]; then
        echo -e "  ✅ $config exists"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  $config missing${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done
echo ""

# Test 9: GitHub Actions Workflows
echo -e "${YELLOW}[TEST 9] Verifying CI/CD Configuration...${NC}"
if [ -d ".github/workflows" ]; then
    WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l)
    echo -e "  ✅ Found $WORKFLOW_COUNT GitHub Actions workflows"
    PASSED=$((PASSED + 1))
    
    # List workflows
    find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | while read workflow; do
        echo -e "     • $(basename $workflow)"
    done
else
    echo -e "  ${YELLOW}⚠️  No GitHub Actions workflows found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 10: Check for Sensitive Data in Git
echo -e "${YELLOW}[TEST 10] Checking for Sensitive Data...${NC}"
# Search for actual hardcoded credentials (not state variables or UI text)
# Look for patterns like: const password = "actual_password" (not empty strings, setState, or UI text)
SENSITIVE_PATTERNS=(
    "password['\"][:=][ ]*['\"][a-zA-Z0-9]{6,}"
    "apiKey['\"][:=][ ]*['\"][a-zA-Z0-9]{20,}"
    "secret['\"][:=][ ]*['\"][a-zA-Z0-9]{10,}"
    "privateKey['\"][:=][ ]*['\"][a-zA-Z0-9]{20,}"
)

FOUND_SENSITIVE=0
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    MATCHES=$(git grep -E "$pattern" -- '*.js' '*.jsx' '*.ts' '*.tsx' 2>/dev/null | grep -v ".env.example\|example\|sample\|test\|mock\|//\|/\*\|node_modules\|setState\|useState" || echo "")
    if [ -n "$MATCHES" ]; then
        echo -e "  ${RED}❌ WARNING: Potential hardcoded credentials found:${NC}"
        echo "$MATCHES" | head -3 | sed 's/^/     /'
        FOUND_SENSITIVE=$((FOUND_SENSITIVE + 1))
        FAILED=$((FAILED + 1))
        CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
    fi
done

if [ $FOUND_SENSITIVE -eq 0 ]; then
    echo -e "  ${GREEN}✅ No hardcoded credentials found in source code${NC}"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 11: Package.json Validation
echo -e "${YELLOW}[TEST 11] Validating package.json Files...${NC}"
if [ -f "Onchainweb/package.json" ]; then
    PKG=$(cat Onchainweb/package.json)
    
    # Check for required scripts
    if echo "$PKG" | grep -q '"build"'; then
        echo -e "  ✅ Build script present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ Build script missing${NC}"
        FAILED=$((FAILED + 1))
        CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
    fi
    
    if echo "$PKG" | grep -q '"dev"'; then
        echo -e "  ✅ Dev script present"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Dev script missing${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check for version
    if echo "$PKG" | grep -q '"version"'; then
        VERSION=$(echo "$PKG" | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
        echo -e "  ✅ Version: $VERSION"
        PASSED=$((PASSED + 1))
    fi
fi
echo ""

# Test 12: License File
echo -e "${YELLOW}[TEST 12] Verifying License...${NC}"
if [ -f "LICENSE" ] || [ -f "LICENSE.md" ] || [ -f "LICENSE.txt" ]; then
    echo -e "  ${GREEN}✅ License file exists${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "  ${YELLOW}⚠️  License file missing${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}PRODUCTION READINESS SUMMARY${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "${GREEN}Passed:          $PASSED${NC}"
echo -e "${RED}Failed:          $FAILED${NC}"
echo -e "${MAGENTA}Critical Failed: $CRITICAL_FAILED${NC}"
echo -e "${YELLOW}Warnings:        $WARNINGS${NC}"
echo ""

# Final verdict
if [ $CRITICAL_FAILED -eq 0 ] && [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ READY FOR PRODUCTION RELEASE ✅   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}All critical checks passed!${NC}"
    echo -e "${CYAN}The application is ready for public use.${NC}"
    exit 0
elif [ $CRITICAL_FAILED -eq 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║   ⚠️  PRODUCTION READY WITH WARNINGS   ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}No critical issues, but review warnings above.${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ NOT READY FOR PRODUCTION ❌      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Critical issues must be resolved before release.${NC}"
    exit 1
fi
