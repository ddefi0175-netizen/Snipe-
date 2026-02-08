#!/bin/bash
# Smoke test script for Snipe platform
# Tests that the built application can be served and accessed via HTTP

set -e

echo "🚀 Starting smoke test..."

# Change to frontend directory
cd Onchainweb

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Start preview server in background
echo "🚀 Starting preview server..."
npx vite preview --port 5173 >../vite-preview.log 2>&1 &
VITE_PID=$!
echo "Preview server started with PID: $VITE_PID"

# Give server time to start
sleep 3

# Function to cleanup on exit
cleanup() {
  echo "🧹 Cleaning up preview server..."
  if ps -p "$VITE_PID" > /dev/null 2>&1; then
    echo "Stopping process $VITE_PID..."
    kill "$VITE_PID" 2>/dev/null || true
    # Wait for process to die
    for i in 1 2 3 4 5; do
      if ! ps -p "$VITE_PID" > /dev/null 2>&1; then
        break
      fi
      sleep 1
    done
    # Force kill if still running
    if ps -p "$VITE_PID" > /dev/null 2>&1; then
      echo "Force killing process $VITE_PID..."
      kill -9 "$VITE_PID" 2>/dev/null || true
    fi
  fi
  echo "✅ Cleanup complete"
}

# Register cleanup function
trap cleanup EXIT

# Test server with retries
echo "🔍 Running smoke test..."
SUCCESS=false
MAX_RETRIES=15
i=1

while [ $i -le $MAX_RETRIES ]; do
  echo "Attempt $i/$MAX_RETRIES: Testing http://localhost:5173..."
  
  if curl -fsS http://localhost:5173 >/dev/null 2>&1; then
    echo "✅ Smoke test passed!"
    SUCCESS=true
    break
  fi
  
  # Check if server process is still running
  if ! ps -p "$VITE_PID" > /dev/null 2>&1; then
    echo "❌ Preview server died unexpectedly"
    echo "📋 Server logs:"
    tail -n 50 ../vite-preview.log || true
    exit 1
  fi
  
  i=$((i + 1))
  sleep 2
done

if [ "$SUCCESS" = "false" ]; then
  echo "❌ Smoke test failed after $MAX_RETRIES attempts"
  echo "📋 Preview server logs:"
  tail -n 50 ../vite-preview.log || true
  exit 1
fi

echo "✅ All smoke tests passed!"
exit 0
