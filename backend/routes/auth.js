// Authentication routes for Admin/Master login
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'snipe-jwt-secret-2025-change-in-production';
const JWT_EXPIRES = '24h';

// Master credentials from environment variables
const MASTER_USERNAME = process.env.MASTER_USERNAME || 'master';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'OnchainWeb2025!';

// Admin accounts stored in memory (in production, use database)
let adminAccounts = [];

// Load admin accounts from environment if available
if (process.env.ADMIN_ACCOUNTS) {
  try {
    adminAccounts = JSON.parse(process.env.ADMIN_ACCOUNTS);
  } catch (e) {
    console.error('Failed to parse ADMIN_ACCOUNTS:', e);
  }
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user is master
const requireMaster = (req, res, next) => {
  if (req.user.role !== 'master') {
    return res.status(403).json({ error: 'Master access required' });
  }
  next();
};

// Middleware to check if user is admin or master
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'master' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// POST /api/auth/login - Login for master/admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Check master credentials
    if (username === MASTER_USERNAME && password === MASTER_PASSWORD) {
      const token = jwt.sign(
        { 
          username: 'master', 
          role: 'master',
          permissions: {
            manageUsers: true,
            manageBalances: true,
            manageKYC: true,
            manageTrades: true,
            viewReports: true,
            createAdmins: true
          }
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          username: 'master',
          role: 'master',
          permissions: {
            manageUsers: true,
            manageBalances: true,
            manageKYC: true,
            manageTrades: true,
            viewReports: true,
            createAdmins: true
          }
        }
      });
    }
    
    // Check admin accounts
    const admin = adminAccounts.find(a => a.username === username && a.password === password);
    if (admin) {
      const token = jwt.sign(
        { 
          username: admin.username, 
          role: 'admin',
          permissions: admin.permissions || {
            manageUsers: true,
            manageBalances: true,
            manageKYC: true,
            manageTrades: false,
            viewReports: true,
            createAdmins: false
          }
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          username: admin.username,
          role: 'admin',
          permissions: admin.permissions
        }
      });
    }
    
    // Invalid credentials
    return res.status(401).json({ error: 'Invalid username or password' });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/verify - Verify token is still valid
router.post('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/change-password - Change master password (master only)
router.post('/change-password', verifyToken, requireMaster, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    
    // Verify current password
    if (currentPassword !== MASTER_PASSWORD) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // In production, update this in database or environment
    // For now, we'll return success but note it needs env update
    res.json({
      success: true,
      message: 'Password change requested. Update MASTER_PASSWORD environment variable on Render to complete.',
      newPassword: newPassword // Remove in production - just for setup
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/admin - Create new admin account (master only)
router.post('/admin', verifyToken, requireMaster, async (req, res) => {
  try {
    const { username, password, permissions } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Check if admin already exists
    if (adminAccounts.find(a => a.username === username)) {
      return res.status(400).json({ error: 'Admin username already exists' });
    }
    
    const newAdmin = {
      username,
      password,
      permissions: permissions || {
        manageUsers: true,
        manageBalances: true,
        manageKYC: true,
        manageTrades: false,
        viewReports: true,
        createAdmins: false
      },
      createdAt: new Date().toISOString()
    };
    
    adminAccounts.push(newAdmin);
    
    res.json({
      success: true,
      admin: {
        username: newAdmin.username,
        permissions: newAdmin.permissions,
        createdAt: newAdmin.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/admins - List all admin accounts (master only)
router.get('/admins', verifyToken, requireMaster, (req, res) => {
  res.json({
    success: true,
    admins: adminAccounts.map(a => ({
      username: a.username,
      permissions: a.permissions,
      createdAt: a.createdAt
    }))
  });
});

// DELETE /api/auth/admin/:username - Delete admin account (master only)
router.delete('/admin/:username', verifyToken, requireMaster, (req, res) => {
  const { username } = req.params;
  
  const index = adminAccounts.findIndex(a => a.username === username);
  if (index === -1) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  
  adminAccounts.splice(index, 1);
  
  res.json({
    success: true,
    message: `Admin ${username} deleted`
  });
});

// Export router and middleware
module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.requireMaster = requireMaster;
module.exports.requireAdmin = requireAdmin;
