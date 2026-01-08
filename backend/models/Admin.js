const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'master'], default: 'admin' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },

  // Granular permissions - what features this admin can access
  permissions: {
    // User management
    manageUsers: { type: Boolean, default: true },
    manageBalances: { type: Boolean, default: true },
    manageKYC: { type: Boolean, default: true },

    // Trading features
    manageTrades: { type: Boolean, default: false },
    manageStaking: { type: Boolean, default: false },
    manageAIArbitrage: { type: Boolean, default: false },

    // Financial operations
    manageDeposits: { type: Boolean, default: true },
    manageWithdrawals: { type: Boolean, default: true },

    // Communication
    customerService: { type: Boolean, default: true },

    // Reports & settings
    viewReports: { type: Boolean, default: true },
    viewLogs: { type: Boolean, default: false },
    siteSettings: { type: Boolean, default: false },

    // Admin management (master only typically)
    createAdmins: { type: Boolean, default: false }
  },

  // Assigned users - if empty, admin can see all users (based on permissions)
  // If populated, admin can ONLY manage these specific users
  assignedUsers: [{ type: String }], // Array of user IDs

  // Restriction mode: 'all' = can manage all users, 'assigned' = only assigned users
  userAccessMode: { type: String, enum: ['all', 'assigned'], default: 'all' },

  // Audit fields
  createdBy: { type: String, default: 'master' },
  lastLogin: { type: Date },
  lastLoginIP: { type: String },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
AdminSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Admin', AdminSchema);
