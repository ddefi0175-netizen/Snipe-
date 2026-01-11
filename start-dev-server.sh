#!/bin/bash

# Snipe Platform - Development Server Startup Script
# Automatically navigates to correct directory and starts dev server

clear

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 Snipe Platform - Development Server"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -f "Onchainweb/package.json" ]; then
    echo "❌ Error: Must run this script from /workspaces/Snipe- directory"
    echo ""
    echo "Current directory: $(pwd)"
    echo "Expected: /workspaces/Snipe-"
    echo ""
    exit 1
fi

# Navigate to Onchainweb directory
cd Onchainweb

echo "📂 Working directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time setup)..."
    npm install
    echo ""
fi

# Check environment variables
echo "🔍 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env created - please configure your Firebase credentials"
    else
        echo "❌ .env.example not found!"
    fi
    echo ""
fi

# Check Firebase configuration
if grep -q "YOUR_FIREBASE" .env 2>/dev/null; then
    echo "⚠️  Warning: Firebase credentials not configured in .env"
    echo "   Please update .env with your Firebase project details"
    echo ""
elif ! grep -q "VITE_FIREBASE_API_KEY" .env 2>/dev/null; then
    echo "⚠️  Warning: Firebase API key not found in .env"
    echo ""
else
    echo "✅ Firebase configuration found"
    echo ""
fi

# Check if port is already in use
PORT=5173
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is already in use"
    echo "   Vite will automatically use the next available port"
    echo ""
fi

echo "════════════════════════════════════════════════════════════════"
echo "  Starting Development Server..."
echo "════════════════════════════════════════════════════════════════"
echo ""

# Start dev server
npm run dev

# If server exits, show message
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Development server stopped"
echo "════════════════════════════════════════════════════════════════"
