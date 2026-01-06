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
};

// Export base URL for direct use if needed
export { API_BASE };
