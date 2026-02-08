// Admin Auto-Detection Component
// Automatically redirects to admin dashboard when admin wallet connects
// Handles user auto-provisioning on first wallet connection

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUniversalWallet } from '../lib/walletConnect.jsx'
import { checkWalletForAdminAccess, autoProvisionUser } from '../lib/adminProvisioning.js'
import { ADMIN_GUARD, ROUTES } from '../config/constants.js'

export default function AdminAutoDetector({ children }) {
  // Enable wallet auto-detection only when explicitly allowed via env
  const ENABLE_WALLET_ADMIN_AUTODETECT = import.meta.env?.VITE_ENABLE_ADMIN_WALLET_AUTODETECT === 'true'

  // If auto-detect is disabled, don't run any wallet-based admin logic.
  if (!ENABLE_WALLET_ADMIN_AUTODETECT) {
    return children
  }
  const navigate = useNavigate()
  const wallet = useUniversalWallet()
  const [hasChecked, setHasChecked] = useState(false)
  const [isAdminRedirecting, setIsAdminRedirecting] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Skip if no wallet connected or already checked
      if (!wallet?.address || hasChecked) return

      // Prevent redirect loop - don't check if already on admin route
      const currentPath = window.location.pathname
      if (currentPath === ROUTES.MASTER_ADMIN || currentPath === ROUTES.ADMIN) {
        console.log('[ADMIN-DETECT] Already on admin route, skipping check')
        setHasChecked(true)
        return
      }

      try {
        console.log('[ADMIN-DETECT] Checking wallet for admin access:', wallet.address)

        // Check if this wallet belongs to an admin
        const adminCheck = await checkWalletForAdminAccess(wallet.address)

        if (adminCheck.isAdmin) {
          console.log('[ADMIN-DETECT] Admin detected:', adminCheck.email, 'Role:', adminCheck.role)
          setIsAdminRedirecting(true)

          // Auto-login if email and role are set
          if (adminCheck.email && adminCheck.role) {
            const sessionData = {
              username: adminCheck.email.split('@')[0],
              email: adminCheck.email,
              wallet: wallet.address,
              role: adminCheck.role,
              timestamp: Date.now(),
              autoLoggedIn: true
            }
            localStorage.setItem('masterAdminSession', JSON.stringify(sessionData))
            console.log('[ADMIN-DETECT] Auto-login session created for:', adminCheck.email)
          }

          // Redirect to appropriate admin dashboard
          const adminRoute = adminCheck.role === 'master' ? ROUTES.MASTER_ADMIN : ROUTES.ADMIN
          console.log('[ADMIN-DETECT] Redirecting to:', adminRoute)
          navigate(adminRoute)
          return
        }

        // If not admin but wallet first-time, auto-provision user
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
        const userExists = registeredUsers.some(u => u.wallet?.toLowerCase() === wallet.address.toLowerCase())

        if (!userExists) {
          console.log('[ADMIN-DETECT] First-time wallet connection, auto-provisioning user')
          autoProvisionUser(wallet.address, {
            wallet: wallet.address,
            chainId: wallet.chainId,
            connectedAt: new Date().toISOString()
          })
        }

        setHasChecked(true)
      } catch (error) {
        console.error('[ADMIN-DETECT] Error checking admin access:', error)
        setHasChecked(true)
      }
    }

    // Debounce wallet address changes
    const timer = setTimeout(checkAdminAccess, 500)
    return () => clearTimeout(timer)
  }, [wallet?.address, hasChecked, navigate])

  // Show loading overlay while redirecting
  if (isAdminRedirecting) {
    return (
      <div suppressHydrationWarning style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(124, 58, 237, 0.3)',
            borderTop: '3px solid #7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Redirecting to admin dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return children
}
