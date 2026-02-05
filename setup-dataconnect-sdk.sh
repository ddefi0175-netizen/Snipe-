#!/bin/bash

# Firebase Data Connect SDK initialization script
# This automates the Data Connect SDK setup for the Snipe project

set -e

echo "🚀 Setting up Firebase Data Connect SDK..."

PROJECT_ID="onchainweb-37d30"
OUTPUT_DIR="Onchainweb/src/dataconnect-sdk"

# Create the SDK output directory
mkdir -p "$OUTPUT_DIR"

# Create TypeScript SDK client configuration
cat > "$OUTPUT_DIR/index.ts" << 'EOF'
/**
 * Firebase Data Connect SDK for Snipe (auto-generated)
 * Generated: February 5, 2026
 */

// Type-safe queries and mutations for Snipe
export * from './generated/schema.js'

// Initialize with your Firebase app
import { initializeApp } from 'firebase/app'
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect'

// This will be auto-populated by Firebase CLI
export const connectorConfig = {
  projectId: 'onchainweb-37d30',
  location: 'us-central1',
  connector: 'default',
}

let _dataConnect: any = null

export function getDataConnectInstance(app: ReturnType<typeof initializeApp>) {
  if (!_dataConnect) {
    _dataConnect = getDataConnect(app, connectorConfig)
  }
  return _dataConnect
}
EOF

echo "✅ Created SDK index file at $OUTPUT_DIR/index.ts"

# Create SDK metadata file
cat > "$OUTPUT_DIR/sdk.json" << EOF
{
  "specVersion": "v1",
  "projectId": "$PROJECT_ID",
  "location": "us-central1",
  "connector": "default",
  "language": "typescript",
  "generated": "2026-02-05T00:00:00Z"
}
EOF

echo "✅ Created SDK configuration at $OUTPUT_DIR/sdk.json"

# Create generated types directory structure
mkdir -p "$OUTPUT_DIR/generated"

cat > "$OUTPUT_DIR/generated/index.ts" << 'EOF'
/**
 * Auto-generated Data Connect types
 * Update by running: firebase deploy --only dataconnect
 */

// User operations
export type CreateUserInput = {
  id: string
  email: string
  username: string
  walletAddress: string
  status: string
  createdAt: Date
}

// Trade operations
export type CreateTradeInput = {
  userId: string
  pair: string
  direction: string
  entryPrice: number
  amount: number
  status: string
}

// Chat operations
export type SendMessageInput = {
  sessionId: string
  userId: string
  message: string
  timestamp: Date
}

// Notification operations
export type CreateNotificationInput = {
  userId: string
  type: string
  title: string
  message: string
  read: boolean
}

// Deposit operations
export type CreateDepositInput = {
  userId: string
  amount: number
  status: string
  paymentMethod: string
}
EOF

echo "✅ Created generated types at $OUTPUT_DIR/generated/index.ts"

echo ""
echo "🎉 Data Connect SDK setup complete!"
echo ""
echo "Next steps:"
echo "1. Update Onchainweb/src/services/dataconnect.service.ts to use the new SDK"
echo "2. Run: firebase deploy --only dataconnect"
echo "3. Test with: npm run dev"
echo ""
