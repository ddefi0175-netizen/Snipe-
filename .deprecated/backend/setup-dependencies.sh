#!/bin/bash

# ============================================
# SNIPE Backend - Dependency Setup Script
# ============================================
# This script ensures all backend dependencies are installed
# Run this if you get "node_modules not found" errors

set -e

echo "🔧 Setting up Snipe Backend Dependencies..."
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    echo "📦 Verifying dependencies..."
    npm list --depth=0
else
    echo "❌ node_modules not found, installing dependencies..."
    npm install
    echo "✅ Dependencies installed successfully"
fi

echo ""
echo "🔑 Checking .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "📋 Current configuration:"
    grep -v "^#" .env | grep "=" | head -10
else
    echo "⚠️  .env file missing! Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
        echo "⚠️  IMPORTANT: Update .env with your Firebase credentials before running"
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

echo ""
echo "🚀 Backend is ready!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your Firebase project ID"
echo "2. Run: npm run dev"
echo ""
