// Backend entry point for Snipe

// Uncaught exception handler - must be at the very beginning
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models at the top for performance
const User = require('./models/User');
const Admin = require('./models/Admin');
const Trade = require('./models/Trade');
const Staking = require('./models/Staking');

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

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  // Only set HSTS header when served over HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// --- MongoDB connection with retry logic ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/snipe';
const MAX_RETRIES = 5;
const BASE_RETRY_INTERVAL = 5000; // 5 seconds base interval

const connectToMongoDB = async (attempt = 1) => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ MongoDB connected successfully');
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`✗ MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
    
    if (attempt < MAX_RETRIES) {
      // Exponential backoff: 5s, 10s, 20s, 40s
      const retryDelay = BASE_RETRY_INTERVAL * Math.pow(2, attempt - 1);
      console.log(`  Retrying in ${retryDelay / 1000} seconds...`);
      setTimeout(() => connectToMongoDB(attempt + 1), retryDelay);
    } else {
      console.error('✗ Failed to connect to MongoDB after maximum retries');
      console.error('  Please check your MONGO_URI configuration and network connection');
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✓ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB error:', err.message);
});

// Start connection
connectToMongoDB();

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Snipe backend API running');
});

// Health check endpoints (root and /api for flexibility)
app.get('/health', async (req, res) => {
  try {
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

// --- Error Handling Middleware ---
// 404 handler - must be after all routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler - must be last
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Invalid ID format',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'Resource already exists',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
let server;

const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Received, shutting down gracefully...`);
  
  // Close HTTP server first
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      // Then close MongoDB connection
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  } else {
    // If server not yet started, just close MongoDB
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', promise, 'reason:', reason);
});

server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});
