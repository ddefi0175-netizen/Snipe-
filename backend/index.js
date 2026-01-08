// Backend entry point for Snipe
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration - allow specific origins
const allowedOrigins = [
  'https://www.onchainweb.app',
  'https://onchainweb.app',
  'https://snipe-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel preview URLs
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    console.log('[CORS] Blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MongoDB connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/snipe';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Snipe backend API running');
});

// Health check endpoints (root and /api for flexibility)
app.get('/health', async (req, res) => {
  try {
    const User = require('./models/User');
    const Admin = require('./models/Admin');
    
    // Test database query to ensure real-time data access
    const userCount = await User.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    res.json({
      status: 'ok',
      mongoConnected: mongoose.connection.readyState === 1,
      realTimeData: {
        users: userCount,
        admins: adminCount,
        lastChecked: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      mongoConnected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const User = require('./models/User');
    const Admin = require('./models/Admin');
    const Trade = require('./models/Trade');
    const Staking = require('./models/Staking');
    
    // Comprehensive health check with real-time counts
    const [userCount, adminCount, tradeCount, stakingCount] = await Promise.all([
      User.countDocuments(),
      Admin.countDocuments(),
      Trade.countDocuments(),
      Staking.countDocuments()
    ]);
    
    res.json({
      status: 'ok',
      mongoConnected: mongoose.connection.readyState === 1,
      realTimeData: {
        users: userCount,
        admins: adminCount,
        trades: tradeCount,
        stakingPlans: stakingCount,
        lastChecked: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      mongoConnected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin-activity', require('./routes/adminActivity'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/trades', require('./routes/trades'));
app.use('/api/staking', require('./routes/staking'));

// Configuration routes for admin control
app.use('/api/settings', require('./routes/settings'));
app.use('/api/trading-levels', require('./routes/tradingLevels'));
app.use('/api/bonuses', require('./routes/bonuses'));
app.use('/api/currencies', require('./routes/currencies'));
app.use('/api/networks', require('./routes/networks'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/deposit-wallets', require('./routes/depositWallets'));

// Real-time chat support
app.use('/api/chat', require('./routes/chat'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
