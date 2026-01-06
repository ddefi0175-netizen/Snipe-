const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'master'], default: 'admin' },
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageBalances: { type: Boolean, default: true },
    manageKYC: { type: Boolean, default: true },
    manageTrades: { type: Boolean, default: false },
    viewReports: { type: Boolean, default: true },
    createAdmins: { type: Boolean, default: false }
  },
  assignedUsers: [{ type: String }], // Array of user IDs assigned to this admin
  createdBy: { type: String, default: 'master' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', AdminSchema);
