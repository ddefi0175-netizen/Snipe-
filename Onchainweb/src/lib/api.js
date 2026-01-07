// API Configuration for Snipe Backend
const API_BASE = import.meta.env.VITE_API_BASE || 'https://snipe-api.onrender.com/api';

// Helper function for API calls with retry logic for Render cold starts
async function apiCall(endpoint, options = {}, retries = 2) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('adminToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), attempt === 0 ? 30000 : 60000); // 30s first try, 60s retry
      
      const response = await fetch(url, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      const isTimeout = error.name === 'AbortError' || error.message.includes('timeout');
      const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError');
      
      // Retry on timeout or network errors (Render cold start)
      if ((isTimeout || isNetworkError) && attempt < retries) {
        console.log(`API retry ${attempt + 1}/${retries} for ${endpoint} (server may be waking up)...`);
        await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
        continue;
      }
      
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }
}

// ============== USER API ==============
export const userAPI = {
  // Get all users
  getAll: () => apiCall('/users'),
  
  // Get user by wallet address
  getByWallet: (wallet) => apiCall(`/users/wallet/${wallet}`),
  
  // Get user by userId
  getByUserId: (userId) => apiCall(`/users/id/${userId}`),
  
  // Create new user (register/login)
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update user by MongoDB ID
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),
  
  // Update user by wallet
  updateByWallet: (wallet, userData) => apiCall(`/users/wallet/${wallet}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),
  
  // Submit KYC
  submitKYC: (id, kycData) => apiCall(`/users/${id}/kyc`, {
    method: 'POST',
    body: JSON.stringify(kycData),
  }),
  
  // Review KYC (admin)
  reviewKYC: (id, status) => apiCall(`/users/${id}/kyc/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  // Get pending KYC
  getPendingKYC: () => apiCall('/users/kyc/pending'),
  
  // Freeze/unfreeze user
  setFrozen: (id, frozen) => apiCall(`/users/${id}/freeze`, {
    method: 'PATCH',
    body: JSON.stringify({ frozen }),
  }),
  
  // Set trade mode (admin controls win/lose)
  setTradeMode: (id, tradeMode) => apiCall(`/users/${id}/trade-mode`, {
    method: 'PATCH',
    body: JSON.stringify({ tradeMode }),
  }),
  
  // Update points
  updatePoints: (id, amount, type) => apiCall(`/users/${id}/points`, {
    method: 'PATCH',
    body: JSON.stringify({ amount, type }),
  }),
  
  // Delete user
  delete: (id) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  // Assign user to admin
  assignToAdmin: (id, adminId) => apiCall(`/users/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ adminId }),
  }),
  
  // Get users assigned to admin
  getByAdmin: (adminId) => apiCall(`/users/admin/${adminId}/users`),
  
  // Login or register user by wallet - creates user immediately in backend
  loginByWallet: async (wallet, username, email, walletType) => {
    return await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify({ wallet, username, email, walletType }),
    });
  },
};

// ============== NOTIFICATION API ==============
export const notificationAPI = {
  // Get notifications for user
  getByUserId: (userId) => apiCall(`/notifications/${userId}`),
  
  // Create notification
  create: (notificationData) => apiCall('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  }),
  
  // Mark as read
  markRead: (id) => apiCall(`/notifications/${id}/read`, {
    method: 'PATCH',
  }),
  
  // Mark all as read for user
  markAllRead: (userId) => apiCall(`/notifications/${userId}/read-all`, {
    method: 'PATCH',
  }),
};

// ============== UPLOAD API ==============
export const uploadAPI = {
  // Get all uploads (admin)
  getAll: () => apiCall('/uploads'),
  
  // Get pending uploads
  getPending: () => apiCall('/uploads?status=pending'),
  
  // Get pending count
  getPendingCount: () => apiCall('/uploads/pending/count'),
  
  // Get uploads by user
  getByUserId: (userId) => apiCall(`/uploads?userId=${userId}`),
  
  // Create upload (user submits deposit proof)
  create: (uploadData) => apiCall('/uploads', {
    method: 'POST',
    body: JSON.stringify(uploadData),
  }),
  
  // Update upload status (admin approve/reject)
  updateStatus: (id, status, adminNote) => apiCall(`/uploads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote }),
  }),
  
  // Approve deposit
  approve: (id, amount) => apiCall(`/uploads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'approved', amount }),
  }),
  
  // Reject deposit
  reject: (id, adminNote) => apiCall(`/uploads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'rejected', adminNote }),
  }),
};

// ============== STAKING API ==============
export const stakingAPI = {
  // Get all stakes (admin)
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/staking${params ? '?' + params : ''}`);
  },
  
  // Get active stakes
  getActive: () => apiCall('/staking/active'),
  
  // Get staking statistics
  getStats: () => apiCall('/staking/stats'),
  
  // Get stakes by user
  getByUser: (userId) => apiCall(`/staking/user/${userId}`),
  
  // Create stake
  create: (stakeData) => apiCall('/staking', {
    method: 'POST',
    body: JSON.stringify(stakeData),
  }),
  
  // Claim earnings
  claim: (id) => apiCall(`/staking/${id}/claim`, {
    method: 'PATCH',
  }),
  
  // Withdraw stake
  withdraw: (id) => apiCall(`/staking/${id}/withdraw`, {
    method: 'PATCH',
  }),
  
  // Update stake (admin)
  update: (id, data) => apiCall(`/staking/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  // Delete stake
  delete: (id) => apiCall(`/staking/${id}`, {
    method: 'DELETE',
  }),
};

// ============== TRADE API ==============
export const tradeAPI = {
  // Get all trades (admin)
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/trades${params ? '?' + params : ''}`);
  },
  
  // Get active trades
  getActive: () => apiCall('/trades/active'),
  
  // Get trade statistics
  getStats: () => apiCall('/trades/stats'),
  
  // Get trades by user
  getByUser: (userId) => apiCall(`/trades/user/${userId}`),
  
  // Create trade (user places trade)
  create: (tradeData) => apiCall('/trades', {
    method: 'POST',
    body: JSON.stringify(tradeData),
  }),
  
  // Complete/settle trade
  complete: (id, result, exitPrice, profit, payout) => apiCall(`/trades/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ result, exitPrice, profit, payout }),
  }),
  
  // Admin force trade result
  forceResult: (id, forcedResult) => apiCall(`/trades/${id}/force`, {
    method: 'PATCH',
    body: JSON.stringify({ forcedResult }),
  }),
  
  // Cancel trade
  cancel: (id) => apiCall(`/trades/${id}/cancel`, {
    method: 'PATCH',
  }),
  
  // Delete trade
  delete: (id) => apiCall(`/trades/${id}`, {
    method: 'DELETE',
  }),
};

// ============== AUTH API ==============
export const authAPI = {
  // Login
  login: (username, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  
  // Verify token
  verify: () => apiCall('/auth/verify', {
    method: 'POST',
  }),
  
  // Create admin (master only)
  createAdmin: (adminData) => apiCall('/auth/admin', {
    method: 'POST',
    body: JSON.stringify(adminData),
  }),
  
  // Get all admins
  getAdmins: () => apiCall('/auth/admins'),
  
  // Delete admin
  deleteAdmin: (username) => apiCall(`/auth/admin/${username}`, {
    method: 'DELETE',
  }),
  
  // Reset admin password (master only)
  resetAdminPassword: (username, newPassword) => apiCall(`/auth/admin/${username}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  }),
  
  // Assign users to admin (master only)
  assignUsersToAdmin: (adminId, userIds) => apiCall(`/auth/admin/${adminId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ userIds }),
  }),
};

// ============== SETTINGS API (Master only) ==============
export const settingsAPI = {
  // Get site settings
  get: () => apiCall('/settings'),
  
  // Update settings (master only)
  update: (settings) => apiCall('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};

// ============== TRADING LEVELS API ==============
export const tradingLevelsAPI = {
  // Get all trading levels
  getAll: () => apiCall('/trading-levels'),
  
  // Create trading level (master only)
  create: (level) => apiCall('/trading-levels', {
    method: 'POST',
    body: JSON.stringify(level),
  }),
  
  // Update trading level (master only)
  update: (id, level) => apiCall(`/trading-levels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(level),
  }),
  
  // Delete trading level (master only)
  delete: (id) => apiCall(`/trading-levels/${id}`, {
    method: 'DELETE',
  }),
};

// ============== BONUSES API ==============
export const bonusesAPI = {
  // Get all bonus programs
  getAll: () => apiCall('/bonuses'),
  
  // Create bonus program (master only)
  create: (bonus) => apiCall('/bonuses', {
    method: 'POST',
    body: JSON.stringify(bonus),
  }),
  
  // Update bonus program (master only)
  update: (id, bonus) => apiCall(`/bonuses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bonus),
  }),
  
  // Delete bonus program (master only)
  delete: (id) => apiCall(`/bonuses/${id}`, {
    method: 'DELETE',
  }),
};

// ============== CURRENCIES API ==============
export const currenciesAPI = {
  // Get all currencies
  getAll: () => apiCall('/currencies'),
  
  // Create currency (master only)
  create: (currency) => apiCall('/currencies', {
    method: 'POST',
    body: JSON.stringify(currency),
  }),
  
  // Update currency (master only)
  update: (id, currency) => apiCall(`/currencies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(currency),
  }),
  
  // Delete currency (master only)
  delete: (id) => apiCall(`/currencies/${id}`, {
    method: 'DELETE',
  }),
};

// ============== NETWORKS API ==============
export const networksAPI = {
  // Get all networks
  getAll: () => apiCall('/networks'),
  
  // Create network (master only)
  create: (network) => apiCall('/networks', {
    method: 'POST',
    body: JSON.stringify(network),
  }),
  
  // Update network (master only)
  update: (id, network) => apiCall(`/networks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(network),
  }),
  
  // Delete network (master only)
  delete: (id) => apiCall(`/networks/${id}`, {
    method: 'DELETE',
  }),
};

// ============== RATES API ==============
export const ratesAPI = {
  // Get all exchange rates
  getAll: () => apiCall('/rates'),
  
  // Create rate (master only)
  create: (rate) => apiCall('/rates', {
    method: 'POST',
    body: JSON.stringify(rate),
  }),
  
  // Update rate (master only)
  update: (id, rate) => apiCall(`/rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(rate),
  }),
  
  // Delete rate (master only)
  delete: (id) => apiCall(`/rates/${id}`, {
    method: 'DELETE',
  }),
};

// ============== DEPOSIT WALLETS API ==============
export const depositWalletsAPI = {
  // Get all deposit wallets
  getAll: () => apiCall('/deposit-wallets'),
  
  // Get wallet by network
  getByNetwork: (network) => apiCall(`/deposit-wallets/network/${network}`),
  
  // Create wallet (master only)
  create: (wallet) => apiCall('/deposit-wallets', {
    method: 'POST',
    body: JSON.stringify(wallet),
  }),
  
  // Update wallet (master only)
  update: (id, wallet) => apiCall(`/deposit-wallets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(wallet),
  }),
  
  // Delete wallet (master only)
  delete: (id) => apiCall(`/deposit-wallets/${id}`, {
    method: 'DELETE',
  }),
};

// Export base URL for direct use if needed
export { API_BASE };
