// API Configuration for Snipe Backend
const API_BASE = import.meta.env.VITE_API_BASE || 'https://snipe-api.onrender.com/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============== USER API ==============
export const userAPI = {
  // Get all users
  getAll: () => apiCall('/users'),
  
  // Get user by wallet address
  getByWallet: (wallet) => apiCall(`/users/wallet/${wallet}`),
  
  // Create new user
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update user
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),
  
  // Login or register user by wallet
  loginByWallet: async (wallet) => {
    try {
      // Try to get existing user
      const users = await apiCall('/users');
      const existingUser = users.find(u => u.wallet === wallet);
      
      if (existingUser) {
        return existingUser;
      }
      
      // Create new user
      return await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify({ wallet, role: 'user' }),
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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
  
  // Get uploads by user
  getByUserId: (userId) => apiCall(`/uploads?userId=${userId}`),
  
  // Create upload
  create: (uploadData) => apiCall('/uploads', {
    method: 'POST',
    body: JSON.stringify(uploadData),
  }),
  
  // Update upload status (admin)
  updateStatus: (id, status) => apiCall(`/uploads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

// Export base URL for direct use if needed
export { API_BASE };
