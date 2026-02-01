#!/bin/bash
# Deployment Verification Script for Snipe Platform
# This script verifies that all components are ready for deployment

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Snipe Platform - Deployment Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print status
print_status() {
    if [ "$1" = "PASS" ]; then
        echo -e "  ${GREEN}✓${NC} $2"
        ((PASSED++))
    elif [ "$1" = "FAIL" ]; then
        echo -e "  ${RED}✗${NC} $2"
        ((FAILED++))
    elif [ "$1" = "WARN" ]; then
        echo -e "  ${YELLOW}⚠${NC} $2"
        ((WARNINGS++))
    fi
}

echo "📋 VERIFICATION CHECKLIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Node.js and npm
echo "1️⃣  Checking Node.js Environment..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "PASS" "Node.js installed: $NODE_VERSION"
    
    # Check if version is 18 or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_status "PASS" "Node.js version is 18+: Compatible"
    else
        print_status "WARN" "Node.js version is < 18: May have compatibility issues"
    fi
else
    print_status "FAIL" "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "PASS" "npm installed: $NPM_VERSION"
else
    print_status "FAIL" "npm not installed"
fi
echo ""

# 2. Project Structure
echo "2️⃣  Checking Project Structure..."
if [ -d "Onchainweb" ]; then
    print_status "PASS" "Frontend directory exists (Onchainweb/)"
else
    print_status "FAIL" "Frontend directory missing (Onchainweb/)"
fi

if [ -f "Onchainweb/package.json" ]; then
    print_status "PASS" "package.json exists"
else
    print_status "FAIL" "package.json missing"
fi

if [ -f "Onchainweb/vite.config.js" ]; then
    print_status "PASS" "vite.config.js exists"
else
    print_status "FAIL" "vite.config.js missing"
fi

if [ -f "firebase.json" ]; then
    print_status "PASS" "firebase.json exists"
else
    print_status "WARN" "firebase.json missing (needed for Firebase deployment)"
fi

if [ -f "vercel.json" ]; then
    print_status "PASS" "vercel.json exists"
else
    print_status "WARN" "vercel.json missing (needed for Vercel deployment)"
fi

if [ -f "wrangler.toml" ]; then
    print_status "PASS" "wrangler.toml exists"
else
    print_status "WARN" "wrangler.toml missing (needed for Cloudflare deployment)"
fi
echo ""

# 3. Dependencies
echo "3️⃣  Checking Dependencies..."
if [ -d "Onchainweb/node_modules" ]; then
    print_status "PASS" "node_modules directory exists"
    
    # Check critical dependencies
    if [ -d "Onchainweb/node_modules/react" ]; then
        print_status "PASS" "React installed"
    else
        print_status "FAIL" "React not installed"
    fi
    
    if [ -d "Onchainweb/node_modules/firebase" ]; then
        print_status "PASS" "Firebase installed"
    else
        print_status "FAIL" "Firebase not installed"
    fi
    
    if [ -d "Onchainweb/node_modules/vite" ]; then
        print_status "PASS" "Vite installed"
    else
        print_status "FAIL" "Vite not installed"
    fi
else
    print_status "FAIL" "node_modules not found - run 'npm install' in Onchainweb/"
fi
echo ""

# 4. Environment Configuration
echo "4️⃣  Checking Environment Configuration..."
if [ -f "Onchainweb/.env" ]; then
    print_status "WARN" ".env file exists (should not be committed)"
    
    # Check for critical variables
    if grep -q "VITE_FIREBASE_API_KEY" Onchainweb/.env; then
        print_status "PASS" "VITE_FIREBASE_API_KEY configured"
    else
        print_status "WARN" "VITE_FIREBASE_API_KEY not found in .env"
    fi
    
    if grep -q "VITE_FIREBASE_PROJECT_ID" Onchainweb/.env; then
        print_status "PASS" "VITE_FIREBASE_PROJECT_ID configured"
    else
        print_status "WARN" "VITE_FIREBASE_PROJECT_ID not found in .env"
    fi
    
    if grep -q "VITE_WALLETCONNECT_PROJECT_ID" Onchainweb/.env; then
        print_status "PASS" "VITE_WALLETCONNECT_PROJECT_ID configured"
    else
        print_status "WARN" "VITE_WALLETCONNECT_PROJECT_ID not found in .env"
    fi
else
    print_status "WARN" ".env file not found (environment variables must be set in hosting platform)"
fi

if [ -f ".env.example" ]; then
    print_status "PASS" ".env.example exists for reference"
else
    print_status "WARN" ".env.example missing"
fi
echo ""

# 5. Build Test
echo "5️⃣  Testing Production Build..."
if [ -d "Onchainweb/node_modules" ]; then
    cd Onchainweb
    if npm run build > /tmp/build.log 2>&1; then
        print_status "PASS" "Production build successful"
        
        if [ -d "dist" ]; then
            print_status "PASS" "dist/ directory created"
            
            # Check build size
            BUILD_SIZE=$(du -sh dist | cut -f1)
            print_status "PASS" "Build size: $BUILD_SIZE"
            
            # Check for index.html
            if [ -f "dist/index.html" ]; then
                print_status "PASS" "index.html generated"
            else
                print_status "FAIL" "index.html not found in dist/"
            fi
        else
            print_status "FAIL" "dist/ directory not created"
        fi
    else
        print_status "FAIL" "Production build failed (see /tmp/build.log)"
        tail -20 /tmp/build.log
    fi
    cd ..
else
    print_status "FAIL" "Cannot test build - dependencies not installed"
fi
echo ""

# 6. Security
echo "6️⃣  Checking Security Configuration..."
if [ -f "firestore.rules" ]; then
    print_status "PASS" "Firestore security rules exist"
else
    print_status "WARN" "Firestore security rules missing"
fi

if [ -f "firestore.indexes.json" ]; then
    print_status "PASS" "Firestore indexes configuration exists"
else
    print_status "WARN" "Firestore indexes configuration missing"
fi

# Check for .gitignore
if [ -f ".gitignore" ]; then
    print_status "PASS" ".gitignore exists"
    
    if grep -q "\.env" .gitignore; then
        print_status "PASS" ".env files ignored in .gitignore"
    else
        print_status "WARN" ".env not in .gitignore"
    fi
    
    if grep -q "node_modules" .gitignore; then
        print_status "PASS" "node_modules ignored in .gitignore"
    else
        print_status "WARN" "node_modules not in .gitignore"
    fi
else
    print_status "WARN" ".gitignore missing"
fi
echo ""

# 7. Documentation
echo "7️⃣  Checking Documentation..."
DOCS=("README.md" "DEPLOYMENT.md" "QUICK_START_GUIDE.md" "RELEASE_NOTES.md" "SECURITY.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_status "PASS" "$doc exists"
    else
        print_status "WARN" "$doc missing"
    fi
done
echo ""

# 8. Deployment Scripts
echo "8️⃣  Checking Deployment Scripts..."
SCRIPTS=("deploy.sh" "deploy-production.sh" "deploy-vercel.sh" "deploy-complete.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            print_status "PASS" "$script exists and is executable"
        else
            print_status "WARN" "$script exists but is not executable"
        fi
    else
        print_status "WARN" "$script missing"
    fi
done
echo ""

# 9. Git Repository
echo "9️⃣  Checking Git Repository..."
if [ -d ".git" ]; then
    print_status "PASS" "Git repository initialized"
    
    # Check for uncommitted changes
    if git diff --quiet && git diff --staged --quiet; then
        print_status "PASS" "No uncommitted changes"
    else
        print_status "WARN" "Uncommitted changes present"
    fi
    
    # Check current branch
    BRANCH=$(git branch --show-current)
    print_status "PASS" "Current branch: $BRANCH"
else
    print_status "WARN" "Not a git repository"
fi
echo ""

# 10. Deployment Readiness
echo "🔟 Deployment Readiness Summary..."
echo ""

# Calculate total checks
TOTAL=$((PASSED + FAILED + WARNINGS))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ Passed:${NC}   $PASSED"
echo -e "${RED}✗ Failed:${NC}   $FAILED"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo "  Total:    $TOTAL"
echo ""

# Determine deployment readiness
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "🎉 ${GREEN}DEPLOYMENT STATUS: READY${NC}"
        echo ""
        echo "All checks passed! You can proceed with deployment."
    else
        echo -e "✅ ${GREEN}DEPLOYMENT STATUS: READY WITH WARNINGS${NC}"
        echo ""
        echo "All critical checks passed, but there are $WARNINGS warnings."
        echo "Review warnings above and proceed with caution."
    fi
else
    echo -e "❌ ${RED}DEPLOYMENT STATUS: NOT READY${NC}"
    echo ""
    echo "There are $FAILED failed checks that must be resolved before deployment."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Review any warnings above"
echo "2. Set environment variables in your hosting platform:"
echo "   - VITE_FIREBASE_* (8 variables)"
echo "   - VITE_WALLETCONNECT_PROJECT_ID"
echo "   - VITE_ADMIN_ALLOWLIST (optional)"
echo ""
echo "3. Deploy Firestore rules:"
echo "   firebase deploy --only firestore:rules"
echo "   firebase deploy --only firestore:indexes"
echo ""
echo "4. Choose deployment method:"
echo "   • Vercel:    cd Onchainweb && vercel --prod"
echo "   • Cloudflare: cd Onchainweb && wrangler pages deploy dist"
echo "   • Firebase:   firebase deploy --only hosting"
echo ""
echo "5. After deployment, test:"
echo "   • Homepage loads"
echo "   • Wallet connection works"
echo "   • Admin login functional"
echo "   • Real-time updates working"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - DEPLOYMENT.md"
echo "   - PRODUCTION_DEPLOYMENT_GUIDE.md"
echo "   - PUBLIC_RELEASE_GUIDE.md"
echo ""
echo "Good luck with your deployment! 🚀"
echo ""
