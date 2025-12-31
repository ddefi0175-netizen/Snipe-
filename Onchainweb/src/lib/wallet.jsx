import React, { createContext, useContext } from 'react'

// Simplified wallet context - no ethers.js dependency
// Uses localStorage-based wallet system from Wallet.jsx component

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  // Simple mock wallet state - actual wallet functionality is in Wallet.jsx
  const wallet = {
    providerAvailable: false,
    address: null,
    balance: null,
    chainId: null,
    connect: async () => {
      console.log('Wallet connection handled in Wallet component')
    },
    disconnect: () => {
      console.log('Wallet disconnection handled in Wallet component')
    }
  }
  
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  return useContext(WalletContext)
}