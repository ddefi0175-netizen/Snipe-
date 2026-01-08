// Authentication routes for Admin/Master login
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// JWT Secret - REQUIRED in production (no insecure fallback)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}
const JWT_EXPIRES = '24h';

// Master credentials - REQUIRED in production (no insecure fallbacks)
const MASTER_USERNAME = process.env.MASTER_USERNAME;
const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
if (!MASTER_USERNAME || !MASTER_PASSWORD) {
  console.error('FATAL: MASTER_USERNAME and MASTER_PASSWORD environment variables are required');
  process.exit(1);
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[VERIFY] No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('[VERIFY] Token verified for user:', decoded.username, 'role:', decoded.role);
    next();
  } catch (error) {
    console.log('[VERIFY] Token error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user is master
const requireMaster = (req, res, next) => {
  console.log('[REQUIRE_MASTER] Checking user:', req.user.username, 'role:', req.user.role);
  if (req.user.role !== 'master') {
    console.log('[REQUIRE_MASTER] Access denied - not master');
    return res.status(403).json({ error: 'Master access required' });
  }
  console.log('[REQUIRE_MASTER] Access granted');
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

    console.log(`[LOGIN] Attempt for username: ${username}`);

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check master credentials first
    if (username === MASTER_USERNAME && password === MASTER_PASSWORD) {
      console.log(`[LOGIN] Master login successful`)
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

    // Check admin accounts in MongoDB
    const admin = await Admin.findOne({ username });
    console.log(`[LOGIN] Admin lookup for ${username}: ${admin ? 'FOUND' : 'NOT FOUND'}`);

    if (admin) {
      // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
      const isHashed = admin.password && admin.password.startsWith('$2');
      let passwordMatch = false;

      if (isHashed) {
        // Compare with bcrypt for hashed passwords
        passwordMatch = await bcrypt.compare(password, admin.password);
      } else {
        // Legacy plaintext comparison (for backward compatibility during migration)
        passwordMatch = admin.password === password;
        
        // If plaintext password matches, hash it for future logins
        if (passwordMatch) {
          console.log(`[LOGIN] Upgrading plaintext password to hashed for admin: ${username}`);
          admin.password = await bcrypt.hash(password, 10);
        }
      }

      if (passwordMatch) {
        console.log(`[LOGIN] Admin ${username} login successful`);
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
          {
            username: admin.username,
            role: 'admin',
            adminId: admin._id,
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
            adminId: admin._id,
            permissions: admin.permissions
          }
        });
      }
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
    const { username, password, email, permissions, assignedUsers, userAccessMode, customerIds } = req.body;

    console.log('[CREATE_ADMIN] Request from:', req.user.username);
    console.log('[CREATE_ADMIN] New admin username:', username);

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if admin already exists in MongoDB
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Admin username already exists' });
    }

    // Default permissions - all enabled for flexibility unless specified
    const defaultPermissions = {
      manageUsers: true,
      manageBalances: true,
      manageKYC: true,
      manageTrades: true,
      manageStaking: true,
      manageAIArbitrage: true,
      manageDeposits: true,
      manageWithdrawals: true,
      customerService: true,
      viewReports: true,
      viewLogs: true,
      siteSettings: true,
      createAdmins: false  // Only master has this by default
    };

    // Merge provided permissions with defaults
    const finalPermissions = { ...defaultPermissions, ...(permissions || {}) };

    // Allow master to supply a custom list of customer IDs; if provided, we default to "assigned" mode
    const incomingAssigned = Array.isArray(assignedUsers)
      ? assignedUsers
      : Array.isArray(customerIds)
        ? customerIds
        : [];
    const dedupedAssigned = [...new Set(incomingAssigned.filter(Boolean))];

    // Determine user access mode
    const accessMode = userAccessMode || (dedupedAssigned.length > 0 ? 'assigned' : 'all');

    console.log('[CREATE_ADMIN] Permissions:', finalPermissions);
    console.log('[CREATE_ADMIN] Access mode:', accessMode);
    console.log('[CREATE_ADMIN] Assigned users count:', dedupedAssigned.length);

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      email: email || '',
      permissions: finalPermissions,
      assignedUsers: dedupedAssigned,
      userAccessMode: accessMode,
      createdBy: req.user.username,
      status: 'active',
      role: 'admin'
    });

    await newAdmin.save();

    console.log('[CREATE_ADMIN] Successfully created admin:', username);

    res.json({
      success: true,
      message: `Admin ${username} created successfully`,
      admin: {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status,
        permissions: newAdmin.permissions,
        assignedUsers: newAdmin.assignedUsers,
        userAccessMode: newAdmin.userAccessMode,
        createdAt: newAdmin.createdAt,
        createdBy: newAdmin.createdBy
      }
    });

  } catch (error) {
    console.error('[CREATE_ADMIN] Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// GET /api/auth/admins - List all admin accounts (master + admin)
router.get('/admins', verifyToken, requireAdmin, async (req, res) => {
  try {
    console.log(`[ADMINS] Request from user:`, req.user.username, `role:`, req.user.role);
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      admins: admins.map(a => ({
        _id: a._id,
        username: a.username,
        email: a.email,
        status: a.status,
        permissions: a.permissions,
        assignedUsers: a.assignedUsers,
        userAccessMode: a.userAccessMode,
        lastLogin: a.lastLogin,
        lastLoginIP: a.lastLoginIP,
        loginCount: a.loginCount,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/admin/:id - Get single admin details (master only)
router.get('/admin/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        status: admin.status,
        permissions: admin.permissions,
        assignedUsers: admin.assignedUsers,
        userAccessMode: admin.userAccessMode,
        lastLogin: admin.lastLogin,
        lastLoginIP: admin.lastLoginIP,
        loginCount: admin.loginCount,
        createdBy: admin.createdBy,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/auth/admin/:id - Update admin (master only)
router.patch('/admin/:id', verifyToken, requireMaster, async (req, res) => {
  try {
    const { username, email, status, permissions, assignedUsers, userAccessMode } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (status) updateData.status = status;
    if (permissions) updateData.permissions = permissions;
    if (assignedUsers !== undefined) updateData.assignedUsers = assignedUsers;
    if (userAccessMode) updateData.userAccessMode = userAccessMode;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        status: admin.status,
        permissions: admin.permissions,
        assignedUsers: admin.assignedUsers,
        userAccessMode: admin.userAccessMode,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/auth/admin/:username - Delete admin account (master only)
router.delete('/admin/:username', verifyToken, requireMaster, async (req, res) => {
  try {
    const { username } = req.params;

    const admin = await Admin.findOneAndDelete({ username });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      message: `Admin ${username} deleted`
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/auth/admin/:id/assign - Assign users to admin (master only)
router.patch('/admin/:id/assign', verifyToken, requireMaster, async (req, res) => {
  try {
    const { userIds, userAccessMode } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        assignedUsers: userIds,
        userAccessMode: userAccessMode || 'assigned'
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      admin: {
        _id: admin._id,
        username: admin.username,
        assignedUsers: admin.assignedUsers
      }
    });
  } catch (error) {
    console.error('Assign users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/auth/admin/:username/password - Reset admin password (master only)
router.patch('/admin/:username/password', verifyToken, requireMaster, async (req, res) => {
  try {
    const { username } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const admin = await Admin.findOneAndUpdate(
      { username },
      { password: hashedPassword },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      message: `Password reset for ${username}`
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/status - Get real-time authentication status (authenticated users only)
router.get('/status', verifyToken, async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get current user's info
    let userInfo = {
      username: req.user.username,
      role: req.user.role,
      permissions: req.user.permissions || {}
    };

    // If admin, get assigned users count
    if (req.user.role === 'admin' && req.user.adminId) {
      const admin = await Admin.findById(req.user.adminId);
      if (admin) {
        let assignedUsersCount = 0;
        if (admin.userAccessMode === 'all') {
          assignedUsersCount = await User.countDocuments();
        } else {
          assignedUsersCount = admin.assignedUsers.length;
        }
        userInfo.assignedUsersCount = assignedUsersCount;
        userInfo.userAccessMode = admin.userAccessMode;
      }
    }

    // Get system-wide stats for master
    if (req.user.role === 'master') {
      const [totalUsers, totalAdmins, activeUsers] = await Promise.all([
        User.countDocuments(),
        Admin.countDocuments(),
        User.countDocuments({ frozen: false })
      ]);
      
      userInfo.systemStats = {
        totalUsers,
        totalAdmins,
        activeUsers,
        frozenUsers: totalUsers - activeUsers
      };
    }

    res.json({
      success: true,
      user: userInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export router and middleware
module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.requireMaster = requireMaster;
module.exports.requireAdmin = requireAdmin;
