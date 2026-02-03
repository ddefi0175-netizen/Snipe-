#!/bin/bash

# =============================================================================
# Vercel Environment Variables Checker Script for onchainweb.site
# =============================================================================
# This script checks the current status of Vercel environment variables
# and verifies which required variables are set.
#
# Usage: ./check-vercel-env.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Function to print colored output
print_header() {
    echo -e "\n${BLUE}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${BOLD}  $1${NC}"
    echo -e "${BLUE}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a Vercel environment variable exists
check_vercel_env() {
    local var_name="$1"
    local env_type="$2"  # production, preview, or development
    
    # Try to list the specific variable
    local result=$(vercel env ls 2>/dev/null | grep -E "^${var_name}[[:space:]]" | grep -i "$env_type" || echo "")
    
    if [ -n "$result" ]; then
        echo "set"
    else
        echo "missing"
    fi
}

# Required environment variables
REQUIRED_ADMIN_VARS=(
    "VITE_ENABLE_ADMIN"
    "VITE_ADMIN_ROUTE"
    "VITE_MASTER_ADMIN_ROUTE"
    "VITE_ADMIN_ALLOWLIST"
)

REQUIRED_FIREBASE_VARS=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
    "VITE_FIREBASE_MEASUREMENT_ID"
)

OPTIONAL_VARS=(
    "VITE_WALLETCONNECT_PROJECT_ID"
    "VITE_TELEGRAM_BOT_TOKEN"
    "VITE_TELEGRAM_CHAT_ID"
)

# =============================================================================
# MAIN SCRIPT
# =============================================================================

print_header "Vercel Environment Variables Status"

# Check Vercel CLI installation
if ! command_exists vercel; then
    print_error "Vercel CLI is not installed"
    echo ""
    echo "Install with: npm install -g vercel"
    echo "Then run this script again."
    exit 1
fi

print_success "Vercel CLI is installed ($(vercel --version))"

# Check login status
echo ""
if vercel whoami >/dev/null 2>&1; then
    VERCEL_USER=$(vercel whoami)
    print_success "Logged in as: $VERCEL_USER"
else
    print_error "Not logged in to Vercel"
    echo ""
    echo "Please log in with: vercel login"
    exit 1
fi

# Check if linked to a project
echo ""
print_info "Checking project link..."

# Check in root directory first
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    PROJECT_NAME=$(cat .vercel/project.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "Unknown")
    print_success "Linked to project: $PROJECT_NAME"
elif [ -d "Onchainweb" ]; then
    if ! cd Onchainweb; then
        print_error "Failed to access Onchainweb directory"
        exit 1
    fi
    
    if [ -f ".vercel/project.json" ]; then
        PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
        PROJECT_NAME=$(cat .vercel/project.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "Unknown")
        print_success "Linked to project: $PROJECT_NAME"
    else
        print_warning "Not linked to a Vercel project"
        echo "Run 'vercel link' from the Onchainweb directory to link this project."
        cd ..
        exit 1
    fi
    
    cd ..
else
    print_error "Onchainweb directory not found"
    exit 1
fi

# Get list of all environment variables
print_header "Fetching Environment Variables"

echo "Retrieving environment variables from Vercel..."
echo ""

# Create temporary file for env list
TEMP_ENV_FILE=$(mktemp)
vercel env ls > "$TEMP_ENV_FILE" 2>/dev/null || {
    print_error "Failed to retrieve environment variables"
    rm -f "$TEMP_ENV_FILE"
    exit 1
}

# Check Admin Variables
print_header "Admin Configuration Variables"

ADMIN_ALL_SET=true
for var in "${REQUIRED_ADMIN_VARS[@]}"; do
    echo -e "${BOLD}$var:${NC}"
    
    PROD_STATUS=$(grep -E "^${var}[[:space:]]" "$TEMP_ENV_FILE" | grep -i "production" > /dev/null 2>&1 && echo "set" || echo "missing")
    PREV_STATUS=$(grep -E "^${var}[[:space:]]" "$TEMP_ENV_FILE" | grep -i "preview" > /dev/null 2>&1 && echo "set" || echo "missing")
    DEV_STATUS=$(grep -E "^${var}[[:space:]]" "$TEMP_ENV_FILE" | grep -i "development" > /dev/null 2>&1 && echo "set" || echo "missing")
    
    if [ "$PROD_STATUS" = "set" ]; then
        echo -e "  Production:   ${GREEN}✅ Set${NC}"
    else
        echo -e "  Production:   ${RED}❌ Missing${NC}"
        ADMIN_ALL_SET=false
    fi
    
    if [ "$PREV_STATUS" = "set" ]; then
        echo -e "  Preview:      ${GREEN}✅ Set${NC}"
    else
        echo -e "  Preview:      ${RED}❌ Missing${NC}"
    fi
    
    if [ "$DEV_STATUS" = "set" ]; then
        echo -e "  Development:  ${GREEN}✅ Set${NC}"
    else
        echo -e "  Development:  ${RED}❌ Missing${NC}"
    fi
    
    echo ""
done

# Check Firebase Variables
print_header "Firebase Configuration Variables"

FIREBASE_ALL_SET=true
for var in "${REQUIRED_FIREBASE_VARS[@]}"; do
    echo -e "${BOLD}$var:${NC}"
    
    PROD_STATUS=$(grep -E "^${var}[[:space:]]" "$TEMP_ENV_FILE" | grep -i "production" > /dev/null 2>&1 && echo "set" || echo "missing")
    
    if [ "$PROD_STATUS" = "set" ]; then
        echo -e "  Production:   ${GREEN}✅ Set${NC}"
    else
        echo -e "  Production:   ${RED}❌ Missing${NC}"
        FIREBASE_ALL_SET=false
    fi
    
    echo ""
done

# Check Optional Variables
print_header "Optional Variables"

for var in "${OPTIONAL_VARS[@]}"; do
    echo -e "${BOLD}$var:${NC}"
    
    PROD_STATUS=$(grep -E "^${var}[[:space:]]" "$TEMP_ENV_FILE" | grep -i "production" > /dev/null 2>&1 && echo "set" || echo "missing")
    
    if [ "$PROD_STATUS" = "set" ]; then
        echo -e "  Production:   ${GREEN}✅ Set${NC}"
    else
        echo -e "  Production:   ${YELLOW}⚠️  Not set (optional)${NC}"
    fi
    
    echo ""
done

# Cleanup
rm -f "$TEMP_ENV_FILE"

# Check deployment status
print_header "Deployment Status"

echo "Checking latest deployment..."

# Change to Onchainweb directory for deployment check
if [ -d "Onchainweb" ]; then
    if ! cd Onchainweb; then
        print_warning "Failed to access Onchainweb directory for deployment check"
    else
        # Get latest deployment info (limit to 1 for efficiency)
        LATEST_DEPLOYMENT=$(vercel ls 2>/dev/null | head -2 | tail -1 || echo "")

        if [ -n "$LATEST_DEPLOYMENT" ]; then
            DEPLOY_URL=$(echo "$LATEST_DEPLOYMENT" | awk '{print $2}')
            DEPLOY_STATUS=$(echo "$LATEST_DEPLOYMENT" | awk '{print $4}')
            DEPLOY_AGE=$(echo "$LATEST_DEPLOYMENT" | awk '{print $5}')
            
            echo -e "Latest Deployment: ${BLUE}$DEPLOY_URL${NC}"
            echo -e "Status: $DEPLOY_STATUS"
            echo -e "Age: $DEPLOY_AGE"
        else
            print_warning "Could not retrieve deployment status"
        fi
        
        cd ..
    fi
else
    print_warning "Onchainweb directory not found. Skipping deployment check."
fi

# Summary
print_header "Summary"

echo ""
if [ "$ADMIN_ALL_SET" = true ] && [ "$FIREBASE_ALL_SET" = true ]; then
    print_success "All required environment variables are configured!"
    echo ""
    echo "${BOLD}Next Steps:${NC}"
    echo "  1. Verify the deployment is complete"
    echo "  2. Visit: ${GREEN}https://onchainweb.site/master-admin${NC}"
    echo "  3. Check that you see the login page (not 'Admin Features Disabled')"
    echo "  4. Create master account in Firebase Console if not done yet"
    echo ""
else
    print_error "Some required environment variables are missing!"
    echo ""
    echo "${BOLD}Missing Variables:${NC}"
    
    if [ "$ADMIN_ALL_SET" = false ]; then
        echo ""
        echo "Admin variables are not fully configured."
        echo "Run: ${BLUE}./setup-vercel-env.sh${NC} to configure them."
    fi
    
    if [ "$FIREBASE_ALL_SET" = false ]; then
        echo ""
        echo "Firebase variables are not fully configured."
        echo "Run: ${BLUE}./setup-vercel-env.sh${NC} to configure them."
    fi
    
    echo ""
    echo "${BOLD}Quick Fix:${NC}"
    echo "  Run: ${BLUE}./setup-vercel-env.sh${NC}"
    echo ""
fi

# Additional help
echo "${BOLD}Useful Commands:${NC}"
echo "  View all variables:     ${BLUE}vercel env ls${NC}"
echo "  Add a variable:         ${BLUE}vercel env add VAR_NAME production${NC}"
echo "  Remove a variable:      ${BLUE}vercel env rm VAR_NAME production${NC}"
echo "  Trigger redeployment:   ${BLUE}vercel --prod${NC}"
echo ""

exit 0
