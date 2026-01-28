#!/bin/bash

# 🚀 SNIPE FIREBASE CREDENTIALS SETUP WIZARD
# This script helps you configure Firebase credentials interactively

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🔐 SNIPE FIREBASE CREDENTIALS SETUP WIZARD                 ║"
echo "║                                                                ║"
echo "║   Get credentials from: https://console.firebase.google.com   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Firebase credentials already exist
if grep -q "VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID" Onchainweb/.env 2>/dev/null && \
   ! grep -q "VITE_FIREBASE_PROJECT_ID=your-" Onchainweb/.env 2>/dev/null; then
  echo "✅ Firebase credentials already configured!"
  echo ""
  echo "Current project: $(grep 'VITE_FIREBASE_PROJECT_ID=' Onchainweb/.env | cut -d'=' -f2)"
  echo ""
  read -p "Reconfigure credentials? (y/N): " reconfigure
  if [[ ! "$reconfigure" =~ ^[Yy]$ ]]; then
    echo "Exiting setup wizard..."
    exit 0
  fi
fi

echo "📋 INSTRUCTIONS:"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "1. Open https://console.firebase.google.com"
echo "2. Select project: YOUR_FIREBASE_PROJECT_ID"
echo "3. Go to: Settings ⚙️ → Project Settings → Your Apps → Web"
echo "4. Copy the values from the configuration block"
echo ""
echo "You'll need to provide 7 values:"
echo ""

# Array to hold responses
declare -a creds_array
declare -a creds_names=("API_KEY" "AUTH_DOMAIN" "PROJECT_ID" "STORAGE_BUCKET" "MESSAGING_SENDER_ID" "APP_ID" "MEASUREMENT_ID")
declare -a creds_examples=("AIzaSyD..." "project.firebaseapp.com" "YOUR_FIREBASE_PROJECT_ID" "project.appspot.com" "123456789012" "1:123456789012:web:abc123" "G-XXXXXXX")
declare -a creds_env=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_AUTH_DOMAIN" "VITE_FIREBASE_PROJECT_ID" "VITE_FIREBASE_STORAGE_BUCKET" "VITE_FIREBASE_MESSAGING_SENDER_ID" "VITE_FIREBASE_APP_ID" "VITE_FIREBASE_MEASUREMENT_ID")

# Collect credentials
for i in "${!creds_names[@]}"; do
  echo -n "  [$((i+1))/7] ${creds_names[$i]} (${creds_examples[$i]}): "
  read -r value

  if [ -z "$value" ]; then
    echo "❌ Error: Cannot be empty. Try again."
    i=$((i-1))
    continue
  fi

  creds_array[$i]="$value"
done

echo ""
echo "📝 SUMMARY OF PROVIDED CREDENTIALS:"
echo "───────────────────────────────────────────────────────────────"

for i in "${!creds_names[@]}"; do
  # Mask sensitive values for display
  display_val="${creds_array[$i]}"
  if [ ${#display_val} -gt 20 ]; then
    display_val="${display_val:0:10}...${display_val: -10}"
  fi
  echo "  ${creds_names[$i]:0:10}: $display_val"
done

echo ""
read -p "✅ Confirm and save credentials? (Y/n): " confirm
if [[ ! "$confirm" =~ ^[Yy]?$ ]] || [[ "$confirm" == "n" ]]; then
  echo "Cancelled. No changes made."
  exit 1
fi

echo ""
echo "💾 Updating Onchainweb/.env..."

# Update frontend .env with credentials
for i in "${!creds_array[@]}"; do
  env_key="${creds_env[$i]}"
  value="${creds_array[$i]}"

  # Use a sed command to update or create the env variable
  if grep -q "^${env_key}=" Onchainweb/.env; then
    # Update existing line
    sed -i "s|^${env_key}=.*|${env_key}=${value}|" Onchainweb/.env
  else
    # Add new line after header
    echo "${env_key}=${value}" >> Onchainweb/.env
  fi
done

echo "✅ Credentials saved to Onchainweb/.env"
echo ""
echo "🔍 Validating configuration..."
sleep 1

# Run validation
if [ -f "validate-config.sh" ]; then
  ./validate-config.sh
else
  echo "⚠️  validate-config.sh not found"
fi

echo ""
echo "═════════════════════════════════════════════════════════════════"
echo "✨ NEXT STEPS:"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "1. Start backend:  cd backend && npm run dev"
echo "2. Start frontend: cd Onchainweb && npm run dev"
echo "3. Test at: http://localhost:5173"
echo ""
echo "═════════════════════════════════════════════════════════════════"
