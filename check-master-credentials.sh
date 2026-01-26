#!/bin/bash

# Master Account Credential Checker
# Helps verify and display current master account setup

set -e

echo ""
echo "🔐 Master Account Credential Checker"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() { echo -e "\n${BLUE}═══ $1 ═══${NC}\n"; }

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "Onchainweb" ]; then
    print_error "This script must be run from the repository root directory"
    exit 1
fi

# Navigate to root if in subdirectory
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

print_header "Firebase Admin Setup (Primary System)"

# Check Firebase environment variables
if [ -f "Onchainweb/.env" ]; then
    print_success "Found Onchainweb/.env file"
    
    # Check if admin is enabled
    if grep -q "VITE_ENABLE_ADMIN=true" Onchainweb/.env; then
        print_success "Admin features are ENABLED"
    else
        print_warning "Admin features are DISABLED (VITE_ENABLE_ADMIN not set to 'true')"
        echo "  → Set VITE_ENABLE_ADMIN=true in Onchainweb/.env to enable"
    fi
    
    # Check admin allowlist
    echo ""
    print_info "Admin Allowlist Configuration:"
    if grep -q "VITE_ADMIN_ALLOWLIST=" Onchainweb/.env; then
        allowlist=$(grep "VITE_ADMIN_ALLOWLIST=" Onchainweb/.env | cut -d'=' -f2-)
        if [ -z "$allowlist" ]; then
            print_warning "VITE_ADMIN_ALLOWLIST is empty"
            echo "  → Add admin emails to VITE_ADMIN_ALLOWLIST (comma-separated)"
        else
            echo "  Allowed admin emails:"
            IFS=',' read -ra EMAILS <<< "$allowlist"
            for email in "${EMAILS[@]}"; do
                email=$(echo "$email" | xargs) # trim whitespace
                if [[ $email == master@* ]] || [[ $email == master.* ]]; then
                    print_success "  • $email (MASTER ROLE)"
                else
                    echo "    • $email (admin role)"
                fi
            done
        fi
    else
        print_warning "VITE_ADMIN_ALLOWLIST not found in .env"
        echo "  → Add VITE_ADMIN_ALLOWLIST=master@gmail.com,admin@example.com"
    fi
    
    # Check Firebase config
    echo ""
    print_info "Firebase Configuration:"
    required_vars=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_AUTH_DOMAIN" "VITE_FIREBASE_PROJECT_ID")
    all_present=true
    for var in "${required_vars[@]}"; do
        if grep -q "$var=" Onchainweb/.env && [ -n "$(grep "$var=" Onchainweb/.env | cut -d'=' -f2-)" ]; then
            print_success "  $var is set"
        else
            print_error "  $var is missing"
            all_present=false
        fi
    done
    
    if [ "$all_present" = true ]; then
        print_success "Firebase configuration appears complete"
    else
        print_warning "Some Firebase variables are missing"
        echo "  → Copy values from Firebase Console > Project Settings"
    fi
    
else
    print_error "Onchainweb/.env file not found"
    echo "  → Copy Onchainweb/.env.example to Onchainweb/.env"
    echo "  → Fill in Firebase and admin configuration"
fi

print_header "Firebase Master Account Login Instructions"

echo "1. Go to Firebase Console: https://console.firebase.google.com"
echo "2. Select your project (check VITE_FIREBASE_PROJECT_ID)"
echo "3. Navigate to Authentication → Users"
echo "4. Verify the master email exists (should start with 'master@' or 'master.')"
echo ""
echo "To login to the platform:"
echo "  • Development: http://localhost:5173/master-admin"
echo "  • Production: https://www.onchainweb.app/master-admin"
echo "  • Use the email and password from Firebase Console"
echo ""

print_header "Legacy Backend Credentials (Deprecated System)"

# Check legacy backend
if [ -f "backend/.env" ]; then
    print_info "Found backend/.env (legacy system)"
    
    if grep -q "MASTER_USERNAME=" backend/.env; then
        username=$(grep "MASTER_USERNAME=" backend/.env | cut -d'=' -f2-)
        if [ -n "$username" ]; then
            echo "  Username: $username"
        fi
    fi
    
    if grep -q "MASTER_PASSWORD=" backend/.env; then
        echo "  Password: [configured in backend/.env]"
    fi
    
    print_warning "Legacy backend is DEPRECATED - use Firebase instead"
else
    print_info "No backend/.env found (this is normal for Firebase-only deployments)"
fi

# Display known legacy credentials from documentation
echo ""
print_info "Legacy Backend Credentials (from MASTER_ACCOUNT_ACCESS_GUIDE.md):"
echo "  Username: snipe_admin_secure_7ecb869e"
echo "  Password: WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E="
echo "  API Endpoint: https://snipe-api.onrender.com/api/auth/login"
echo ""
print_warning "These are for the deprecated MongoDB backend only"

print_header "Quick Tests"

echo "Test Firebase Admin Login (Browser):"
echo "  1. cd Onchainweb && npm run dev"
echo "  2. Open: http://localhost:5173/master-admin"
echo "  3. Enter Firebase email and password"
echo ""

echo "Test Legacy Backend Login (API):"
echo '  curl -X POST https://snipe-api.onrender.com/api/auth/login \'
echo '    -H "Content-Type: application/json" \'
echo '    -d '"'"'{'
echo '      "username": "snipe_admin_secure_7ecb869e",'
echo '      "password": "WQAff7VnYKqV1+qes2hHFvTGJToJvwk1sNLvZTXAW3E="'
echo '    }'"'"
echo ""

print_header "Next Steps"

# Determine what user should do next
needs_setup=false

if [ ! -f "Onchainweb/.env" ]; then
    echo "1. Copy Onchainweb/.env.example to Onchainweb/.env"
    needs_setup=true
fi

if [ -f "Onchainweb/.env" ]; then
    if ! grep -q "VITE_ENABLE_ADMIN=true" Onchainweb/.env; then
        echo "2. Set VITE_ENABLE_ADMIN=true in Onchainweb/.env"
        needs_setup=true
    fi
    
    allowlist=$(grep "VITE_ADMIN_ALLOWLIST=" Onchainweb/.env 2>/dev/null | cut -d'=' -f2- || echo "")
    if [ -z "$allowlist" ]; then
        echo "3. Add admin emails to VITE_ADMIN_ALLOWLIST in Onchainweb/.env"
        needs_setup=true
    fi
fi

if [ "$needs_setup" = false ]; then
    print_success "Configuration looks good!"
    echo ""
    echo "To login:"
    echo "1. Start dev server: cd Onchainweb && npm run dev"
    echo "2. Open: http://localhost:5173/master-admin"
    echo "3. Use Firebase email/password"
else
    echo ""
    print_warning "Complete the steps above to finish admin setup"
fi

echo ""
print_info "For detailed instructions, see:"
echo "  • CHECK_MASTER_ACCOUNT.md (comprehensive guide)"
echo "  • HOW_TO_CREATE_ADMIN_CREDENTIALS.md (Firebase setup)"
echo "  • docs/admin/MASTER_ACCOUNT_ACCESS_GUIDE.md (legacy credentials)"
echo ""
