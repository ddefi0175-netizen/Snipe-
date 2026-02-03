#!/bin/bash

# =============================================================================
# Vercel Environment Variables Setup Script for onchainweb.site
# =============================================================================
# This script automates the configuration of Vercel environment variables
# and triggers a production redeployment to fix the "Admin Features Disabled" issue.
#
# Usage: ./setup-vercel-env.sh
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

# Function to prompt for input with default value
prompt_input() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " result
        echo "${result:-$default}"
    else
        read -p "$prompt: " result
        echo "$result"
    fi
}

# Function to set a Vercel environment variable
set_vercel_env() {
    local var_name="$1"
    local var_value="$2"
    local env_scope="${3:-production preview development}"
    
    echo -e "\nSetting ${BOLD}$var_name${NC}..."
    
    # Remove existing variable if it exists (to avoid duplicates)
    vercel env rm "$var_name" production 2>/dev/null || true
    vercel env rm "$var_name" preview 2>/dev/null || true
    vercel env rm "$var_name" development 2>/dev/null || true
    
    # Set for each environment
    for env in $env_scope; do
        # Capture the vercel command output and status separately
        OUTPUT=$(echo "$var_value" | vercel env add "$var_name" "$env" --force 2>&1)
        STATUS=$?
        
        if [ $STATUS -eq 0 ]; then
            print_success "Set $var_name for $env"
        else
            print_error "Failed to set $var_name for $env"
            echo "$OUTPUT" | grep -v "Warning:" >&2
            return 1
        fi
    done
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

print_header "Vercel Environment Variables Setup"

echo "This script will:"
echo "  1. Check Vercel CLI installation"
echo "  2. Verify Vercel login status"
echo "  3. Set required environment variables"
echo "  4. Trigger production redeployment"
echo "  5. Provide verification steps"
echo ""

# Step 1: Check Vercel CLI installation
print_header "Step 1: Checking Vercel CLI"

if ! command_exists vercel; then
    print_error "Vercel CLI is not installed"
    echo ""
    echo "Installing Vercel CLI..."
    npm install -g vercel
    
    if [ $? -eq 0 ]; then
        print_success "Vercel CLI installed successfully"
    else
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
else
    print_success "Vercel CLI is installed"
    vercel --version
fi

# Step 2: Verify Vercel login
print_header "Step 2: Verifying Vercel Login"

# Check if already logged in
if vercel whoami >/dev/null 2>&1; then
    VERCEL_USER=$(vercel whoami)
    print_success "Logged in as: $VERCEL_USER"
else
    print_warning "Not logged in to Vercel"
    echo ""
    echo "Please log in to Vercel..."
    vercel login
    
    if vercel whoami >/dev/null 2>&1; then
        VERCEL_USER=$(vercel whoami)
        print_success "Logged in as: $VERCEL_USER"
    else
        print_error "Failed to log in to Vercel"
        exit 1
    fi
fi

# Step 3: Get or detect project
print_header "Step 3: Detecting Vercel Project"

# Try to detect project from vercel.json or .vercel directory
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    print_success "Detected project from .vercel/project.json"
elif [ -d "Onchainweb" ]; then
    if ! cd Onchainweb; then
        print_error "Failed to access Onchainweb directory"
        exit 1
    fi
    if [ -f ".vercel/project.json" ]; then
        PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
        print_success "Detected project from Onchainweb/.vercel/project.json"
    fi
    cd ..
fi

if [ -z "$PROJECT_ID" ]; then
    print_warning "Could not auto-detect project. Please link this directory to your Vercel project."
    echo ""
    echo "Linking to Vercel project..."
    
    if [ -d "Onchainweb" ]; then
        if ! cd Onchainweb; then
            print_error "Failed to access Onchainweb directory"
            exit 1
        fi
        vercel link
        cd ..
    else
        print_error "Onchainweb directory not found. Please run this script from the project root."
        exit 1
    fi
fi

print_success "Ready to configure environment variables"

# Step 4: Configure Admin Environment Variables
print_header "Step 4: Configuring Admin Variables"

echo "Setting required admin environment variables..."
echo ""

# Set admin variables (these are known and required)
set_vercel_env "VITE_ENABLE_ADMIN" "true"
set_vercel_env "VITE_ADMIN_ROUTE" "/admin"
set_vercel_env "VITE_MASTER_ADMIN_ROUTE" "/master-admin"
set_vercel_env "VITE_ADMIN_ALLOWLIST" "master@onchainweb.site"

print_success "Admin variables configured successfully"

# Step 5: Configure Firebase Variables
print_header "Step 5: Configuring Firebase Variables"

echo "Firebase credentials are required for the app to function."
echo "You can find these in your Firebase Console:"
echo "  https://console.firebase.google.com → Project Settings → General → Your apps"
echo ""

# Check if .env file exists to read defaults
ENV_FILE=""
if [ -f "Onchainweb/.env" ]; then
    ENV_FILE="Onchainweb/.env"
elif [ -f ".env" ]; then
    ENV_FILE=".env"
fi

# Function to read env variable from file
read_env_var() {
    local var_name="$1"
    local env_file="$2"
    if [ -n "$env_file" ] && [ -f "$env_file" ]; then
        grep "^${var_name}=" "$env_file" 2>/dev/null | cut -d'=' -f2- | tr -d ' "' || echo ""
    else
        echo ""
    fi
}

# Prompt for Firebase credentials
echo "Do you want to configure Firebase credentials now? (y/n)"
read -p "Enter choice: " CONFIGURE_FIREBASE

if [ "$CONFIGURE_FIREBASE" = "y" ] || [ "$CONFIGURE_FIREBASE" = "Y" ]; then
    echo ""
    
    # Get Firebase credentials with defaults from .env if available
    FIREBASE_API_KEY=$(prompt_input "Firebase API Key" "$(read_env_var 'VITE_FIREBASE_API_KEY' "$ENV_FILE")")
    FIREBASE_AUTH_DOMAIN=$(prompt_input "Firebase Auth Domain (e.g., your-project.firebaseapp.com)" "$(read_env_var 'VITE_FIREBASE_AUTH_DOMAIN' "$ENV_FILE")")
    FIREBASE_PROJECT_ID=$(prompt_input "Firebase Project ID" "$(read_env_var 'VITE_FIREBASE_PROJECT_ID' "$ENV_FILE")")
    FIREBASE_STORAGE_BUCKET=$(prompt_input "Firebase Storage Bucket (e.g., your-project.firebasestorage.app)" "$(read_env_var 'VITE_FIREBASE_STORAGE_BUCKET' "$ENV_FILE")")
    FIREBASE_MESSAGING_SENDER_ID=$(prompt_input "Firebase Messaging Sender ID" "$(read_env_var 'VITE_FIREBASE_MESSAGING_SENDER_ID' "$ENV_FILE")")
    FIREBASE_APP_ID=$(prompt_input "Firebase App ID" "$(read_env_var 'VITE_FIREBASE_APP_ID' "$ENV_FILE")")
    FIREBASE_MEASUREMENT_ID=$(prompt_input "Firebase Measurement ID (e.g., G-XXXXXXXXXX)" "$(read_env_var 'VITE_FIREBASE_MEASUREMENT_ID' "$ENV_FILE")")
    
    echo ""
    echo "Setting Firebase environment variables..."
    
    set_vercel_env "VITE_FIREBASE_API_KEY" "$FIREBASE_API_KEY"
    set_vercel_env "VITE_FIREBASE_AUTH_DOMAIN" "$FIREBASE_AUTH_DOMAIN"
    set_vercel_env "VITE_FIREBASE_PROJECT_ID" "$FIREBASE_PROJECT_ID"
    set_vercel_env "VITE_FIREBASE_STORAGE_BUCKET" "$FIREBASE_STORAGE_BUCKET"
    set_vercel_env "VITE_FIREBASE_MESSAGING_SENDER_ID" "$FIREBASE_MESSAGING_SENDER_ID"
    set_vercel_env "VITE_FIREBASE_APP_ID" "$FIREBASE_APP_ID"
    set_vercel_env "VITE_FIREBASE_MEASUREMENT_ID" "$FIREBASE_MEASUREMENT_ID"
    
    print_success "Firebase variables configured successfully"
else
    print_warning "Skipped Firebase configuration"
    echo "You can set these manually later using: vercel env add <VAR_NAME> production"
fi

# Step 6: Configure WalletConnect (optional)
print_header "Step 6: Configuring WalletConnect (Optional)"

echo "WalletConnect Project ID is required for WalletConnect QR code functionality."
echo "Get your free Project ID from: https://cloud.walletconnect.com"
echo ""

WALLETCONNECT_ID=$(prompt_input "WalletConnect Project ID (or leave empty to skip)" "$(read_env_var 'VITE_WALLETCONNECT_PROJECT_ID' "$ENV_FILE")")

if [ -n "$WALLETCONNECT_ID" ]; then
    set_vercel_env "VITE_WALLETCONNECT_PROJECT_ID" "$WALLETCONNECT_ID"
    print_success "WalletConnect configured successfully"
else
    print_warning "Skipped WalletConnect configuration"
fi

# Step 7: Trigger Redeployment
print_header "Step 7: Triggering Production Redeployment"

echo "The environment variables have been set. Now triggering a production redeployment..."
echo ""

# Change to Onchainweb directory
if [ -d "Onchainweb" ]; then
    if ! cd Onchainweb; then
        print_error "Failed to access Onchainweb directory for deployment"
        exit 1
    fi
else
    print_error "Onchainweb directory not found. Cannot deploy."
    exit 1
fi

# Trigger redeploy with --prod flag
echo "Deploying to production..."
vercel --prod --yes

cd ..

print_success "Production redeployment triggered successfully"

# Step 8: Verification Instructions
print_header "Verification Steps"

echo "Your Vercel environment variables have been configured!"
echo ""
echo "${BOLD}Next Steps:${NC}"
echo ""
echo "1. ${BOLD}Wait for deployment to complete${NC}"
echo "   Check deployment status: https://vercel.com/dashboard"
echo ""
echo "2. ${BOLD}Create Master Account in Firebase${NC}"
echo "   • Go to: https://console.firebase.google.com"
echo "   • Navigate to: Authentication → Users → Add user"
echo "   • Email: master@onchainweb.site"
echo "   • Password: [Use a strong password, 12+ characters]"
echo ""
echo "3. ${BOLD}Verify Admin Access${NC}"
echo "   Visit: ${GREEN}https://onchainweb.site/master-admin${NC}"
echo "   Expected: Login page (not 'Admin Features Disabled')"
echo "   Status should show: ${GREEN}VITE_ENABLE_ADMIN = true${NC}"
echo ""
echo "4. ${BOLD}Check Environment Variables${NC}"
echo "   Run: ${BLUE}./check-vercel-env.sh${NC}"
echo "   This will verify all variables are set correctly"
echo ""

print_header "Success!"

echo "Environment variables have been configured successfully."
echo "Monitor your deployment at: https://vercel.com/dashboard"
echo ""
echo "For more information, see:"
echo "  • docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md"
echo "  • MASTER_ACCOUNT_SETUP_GUIDE.md"
echo ""

exit 0
