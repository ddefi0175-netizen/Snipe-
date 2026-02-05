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
