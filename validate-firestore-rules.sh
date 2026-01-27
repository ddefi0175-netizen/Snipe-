#!/bin/bash
# Validate Firestore security rules before deployment

echo "🔍 Validating Firestore Security Rules..."

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found"
    echo "Install: npm install -g firebase-tools"
    exit 1
fi

# Validate syntax
echo "Checking rules syntax..."
firebase firestore:rules:validate

# Security checks
echo "Running security checks..."

if grep -q "allow read, write: if true" firestore.rules; then
    echo "⚠️  WARNING: Overly permissive rules detected!"
    echo "   Lines with 'if true' should be restricted for production"
    read -p "Continue anyway? (y/N): " continue
    if [[ ! "$continue" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Firestore rules validation complete"
