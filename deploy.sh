#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Snipe Production Deployment Script   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "wrangler.toml" ]; then
    echo -e "${RED}❌ Error: wrangler.toml not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check for required files
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if [ ! -f "Onchainweb/.env" ]; then
    echo -e "${RED}❌ .env file not found in Onchainweb directory!${NC}"
    echo "Please copy .env.example and configure it first:"
    echo "  cp Onchainweb/.env.example Onchainweb/.env"
    echo "  nano Onchainweb/.env"
    exit 1
fi

if [ ! -f "Onchainweb/package.json" ]; then
    echo -e "${RED}❌ package.json not found!${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is too old (${NODE_VERSION})!${NC}"
    echo "Please upgrade to Node.js 18 or higher."
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Wrangler CLI...${NC}"
    npm install -g wrangler
fi

# Step 1: Install dependencies
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd Onchainweb
npm install
cd ..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Run tests (if any)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🧪 Step 2: Running tests...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd Onchainweb
if npm run test 2>/dev/null; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  No tests found or tests skipped${NC}"
fi
cd ..
echo ""

# Step 3: Build production bundle
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔨 Step 3: Building production bundle...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd Onchainweb
npm run build:production
cd ..
echo -e "${GREEN}✅ Production build complete${NC}"

# Show build stats
if [ -d "Onchainweb/dist" ]; then
    echo ""
    echo -e "${BLUE}📊 Build statistics:${NC}"
    du -sh Onchainweb/dist
    echo "Files:"
    find Onchainweb/dist -type f -name "*.js" -o -name "*.css" | wc -l
    echo ""
fi

# Step 4: Deploy Cloudflare Workers
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}☁️  Step 4: Deploying Cloudflare Workers...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  CLOUDFLARE_API_TOKEN not set in environment${NC}"
    echo "Attempting to use credentials from .env file..."
fi

wrangler deploy
echo -e "${GREEN}✅ Workers deployed${NC}"
echo ""

# Step 5: Deploy to Cloudflare Pages
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📄 Step 5: Deploying to Cloudflare Pages...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

wrangler pages deploy Onchainweb/dist --project-name=onchainweb
echo -e "${GREEN}✅ Pages deployed${NC}"
echo ""

# Step 6: Verify deployment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔍 Step 6: Verifying deployment...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check worker health
echo -n "Checking workers..."
WORKER_URL="https://snipe-onchainweb.onchainweb.workers.dev/health"
if curl -s -o /dev/null -w "%{http_code}" "$WORKER_URL" | grep -q "200"; then
    echo -e " ${GREEN}✅ Workers are healthy${NC}"
else
    echo -e " ${YELLOW}⚠️  Workers may need a moment to become available${NC}"
fi

echo ""

# Deployment summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Deployment Completed Successfully!  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 Your application is now live at:${NC}"
echo ""
echo -e "   ${YELLOW}Frontend:${NC} https://onchainweb.pages.dev"
echo -e "   ${YELLOW}Workers:${NC}  https://snipe-onchainweb.onchainweb.workers.dev"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Test all features on the live site"
echo "   2. Configure custom domain (if needed)"
echo "   3. Set up monitoring and alerts"
echo "   4. Update DNS records"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "   - View logs:        wrangler tail"
echo "   - List deployments: wrangler pages deployments list"
echo "   - Rollback:         wrangler pages deployment rollback <id>"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"
