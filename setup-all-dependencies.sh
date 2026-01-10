#!/bin/bash

# ============================================
# SNIPE - Full Project Setup Script
# ============================================
# This script ensures both backend and frontend dependencies are installed
# Run this after cloning if you see "node_modules not found" errors

set -e

echo "🔧 Setting up Snipe Project Dependencies..."
echo ""
echo "This script will:"
echo "1. Install backend dependencies"
echo "2. Install frontend dependencies"
echo "3. Verify .env files exist"
echo ""
echo "=================================================="
echo ""

# Backend Setup
echo "📦 BACKEND Setup"
echo "=================================================="
cd backend

if [ -d "node_modules" ]; then
    echo "✅ Backend node_modules exists"
else
    echo "📥 Installing backend dependencies..."
    npm install
    echo "✅ Backend dependencies installed"
fi

if [ -f ".env" ]; then
    echo "✅ Backend .env exists"
else
    echo "⚠️  Creating backend/.env from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Backend .env created"
    fi
fi

cd ..

echo ""

# Frontend Setup
echo "📦 FRONTEND Setup"
echo "=================================================="
cd Onchainweb

if [ -d "node_modules" ]; then
    echo "✅ Frontend node_modules exists"
else
    echo "📥 Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
fi

if [ -f ".env" ]; then
    echo "✅ Frontend .env exists"
else
    echo "⚠️  Creating frontend/.env from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Frontend .env created"
    fi
fi

cd ..

echo ""
echo "=================================================="
echo "✅ SETUP COMPLETE!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Firebase credentials:"
echo "   - Get credentials from https://console.firebase.google.com"
echo "   - Add to Onchainweb/.env (7 values)"
echo "   - Update .firebaserc with project ID"
echo ""
echo "2. Start the servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd Onchainweb && npm run dev"
echo ""
echo "3. Open browser to http://localhost:5173"
echo ""
