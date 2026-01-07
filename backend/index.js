// Backend entry point for Snipe
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
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
