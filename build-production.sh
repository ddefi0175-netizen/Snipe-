#!/bin/bash

# ============================================
# Production Build Script
# Builds optimized production bundle
# ============================================

set -e  # Exit on error

echo "🚀 Starting Production Build..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "Onchainweb" ]; then
  echo -e "${RED}❌ Error: Onchainweb directory not found${NC}"
  echo "Run this script from the root of the repository"
  exit 1
fi

# Step 1: Clean previous builds
echo -e "\n${YELLOW}📦 Step 1: Cleaning previous builds...${NC}"
cd Onchainweb
rm -rf dist node_modules/.vite
echo -e "${GREEN}✓ Cleaned dist and cache${NC}"

# Step 2: Install dependencies
echo -e "\n${YELLOW}📦 Step 2: Installing dependencies...${NC}"
npm ci --prefer-offline --no-audit
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Run production build
echo -e "\n${YELLOW}🔨 Step 3: Building for production...${NC}"
NODE_ENV=production npm run build
echo -e "${GREEN}✓ Build completed${NC}"

# Step 4: Verify build output
echo -e "\n${YELLOW}🔍 Step 4: Verifying build output...${NC}"
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Error: dist directory not created${NC}"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo -e "${RED}❌ Error: index.html not found in dist${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build output verified${NC}"

# Step 5: Display build statistics
echo -e "\n${YELLOW}📊 Step 5: Build Statistics${NC}"
echo "================================"
echo -e "Build directory: ${GREEN}$(pwd)/dist${NC}"
echo -e "Total files: ${GREEN}$(find dist -type f | wc -l)${NC}"
echo -e "Total size: ${GREEN}$(du -sh dist | cut -f1)${NC}"
echo ""
echo "Largest files:"
find dist -type f -exec du -h {} + | sort -rh | head -10

# Step 6: Security check
echo -e "\n${YELLOW}🔒 Step 6: Security check...${NC}"
cd ..
if grep -r "serviceAccountKey\|PRIVATE_KEY\|SECRET_KEY" Onchainweb/dist/ --exclude-dir=node_modules 2>/dev/null; then
  echo -e "${RED}❌ WARNING: Potential secrets found in build!${NC}"
  echo "Please review and remove any sensitive data before deploying."
  exit 1
else
  echo -e "${GREEN}✓ No obvious secrets found${NC}"
fi

# Step 7: Final summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ Production build completed successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test the build locally: cd Onchainweb && npm run preview"
echo "2. Deploy to Vercel: npm run deploy (if configured)"
echo "3. Deploy to Cloudflare Pages: wrangler pages publish Onchainweb/dist"
echo "4. Deploy to Firebase: firebase deploy --only hosting"
echo ""
echo "Build location: Onchainweb/dist"
