/**
 * Database Seed Script for Snipe
 * Run: node seed.js
 *
 * This script populates MongoDB with essential initial data:
 * - Site settings
 * - Master admin account
 * - Admin account (aqiang)
 * - Deposit wallets
 * - Trading levels
 * - Currencies
 * - Networks
 * - Exchange rates
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Admin credentials from environment (with secure defaults for seed only)
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD;
if (!SEED_ADMIN_PASSWORD) {
  console.warn('WARNING: Set SEED_ADMIN_PASSWORD or DEFAULT_ADMIN_PASSWORD env var for production');
}

// Import models
const Admin = require('./models/Admin');
const Settings = require('./models/Settings');
const DepositWallet = require('./models/DepositWallet');
const TradingLevel = require('./models/TradingLevel');
const Currency = require('./models/Currency');
const Network = require('./models/Network');
const ExchangeRate = require('./models/ExchangeRate');

// Seed data
const seedData = {
  // Site settings
  settings: {
    key: 'site_settings',
    siteName: 'OnchainWeb',
    siteUrl: 'https://onchainweb.app',
    supportEmail: 'support@onchainweb.com',
    maintenanceMode: false,
    registrationEnabled: true,
    withdrawalEnabled: true,
    depositEnabled: true,
    tradingEnabled: true,
    minWithdrawal: 10,
    maxWithdrawal: 100000,
    withdrawalFee: 1,
    referralBonus: 50,
    welcomeBonus: 100
  },

  // Admin accounts - password from environment variable
  admins: [
    {
      username: process.env.SEED_ADMIN_USERNAME || 'aqiang',
      password: SEED_ADMIN_PASSWORD || 'CHANGE_ME_IN_PRODUCTION',
      role: 'admin',
      permissions: {
        manageUsers: true,
        manageBalances: true,
        manageKYC: true,
        manageTrades: true,
        viewReports: true,
        createAdmins: false
      },
      createdBy: 'master'
    }
  ],

  // Deposit wallets for different networks
  depositWallets: [
    { network: 'BTC', address: '', label: 'Bitcoin Wallet', status: 'active' },
    { network: 'ETH', address: '', label: 'Ethereum (ERC-20)', status: 'active' },
    { network: 'BSC', address: '', label: 'BNB Smart Chain (BEP-20)', status: 'active' },
    { network: 'TRC20', address: '', label: 'Tron (TRC-20)', status: 'active' },
    { network: 'SOL', address: '', label: 'Solana', status: 'active' },
    { network: 'MATIC', address: '', label: 'Polygon', status: 'active' }
  ],

  // Trading levels
  tradingLevels: [
    { level: 1, name: 'Bronze', countdown: 180, profitPercent: 18, minCapital: 100, maxCapital: 19999 },
    { level: 2, name: 'Silver', countdown: 360, profitPercent: 23, minCapital: 20000, maxCapital: 30000 },
    { level: 3, name: 'Gold', countdown: 720, profitPercent: 33.5, minCapital: 30001, maxCapital: 50000 },
    { level: 4, name: 'Platinum', countdown: 1080, profitPercent: 50, minCapital: 50001, maxCapital: 100000 },
    { level: 5, name: 'Diamond', countdown: 3600, profitPercent: 100, minCapital: 100001, maxCapital: 999999999 }
  ],

  // Supported currencies
  currencies: [
    { name: 'Tether', symbol: 'USDT', icon: '💵' },
    { name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { name: 'BNB', symbol: 'BNB', icon: '🔶' },
    { name: 'Solana', symbol: 'SOL', icon: '◎' },
    { name: 'Tron', symbol: 'TRX', icon: '⧫' },
    { name: 'USD Coin', symbol: 'USDC', icon: '💲' },
    { name: 'Polygon', symbol: 'MATIC', icon: '🟣' }
  ],

  // Networks for deposits/withdrawals
  networks: [
    { name: 'Bitcoin', symbol: 'BTC', chainId: '-', confirmations: 3 },
    { name: 'Ethereum (ERC-20)', symbol: 'ETH', chainId: '1', confirmations: 12 },
    { name: 'BNB Smart Chain (BEP-20)', symbol: 'BSC', chainId: '56', confirmations: 15 },
    { name: 'Tron (TRC-20)', symbol: 'TRC20', chainId: '-', confirmations: 20 },
    { name: 'Solana', symbol: 'SOL', chainId: '-', confirmations: 32 },
    { name: 'Polygon', symbol: 'MATIC', chainId: '137', confirmations: 128 }
  ],

  // Exchange rates (to USDT)
  exchangeRates: [
    { from: 'BTC', to: 'USDT', rate: 97500 },
    { from: 'ETH', to: 'USDT', rate: 3450 },
    { from: 'BNB', to: 'USDT', rate: 710 },
    { from: 'SOL', to: 'USDT', rate: 215 },
    { from: 'TRX', to: 'USDT', rate: 0.25 },
    { from: 'MATIC', to: 'USDT', rate: 0.95 },
    { from: 'USDC', to: 'USDT', rate: 1 }
  ]
};

async function seed() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/snipe';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed Settings
    console.log('\n📝 Seeding Settings...');
    await Settings.findOneAndUpdate(
      { key: 'site_settings' },
      seedData.settings,
      { upsert: true, new: true }
    );
    console.log('   ✅ Settings created/updated');

    // Seed Admins
    console.log('\n👤 Seeding Admin accounts...');
    for (const admin of seedData.admins) {
      await Admin.findOneAndUpdate(
        { username: admin.username },
        admin,
        { upsert: true, new: true }
      );
      console.log(`   ✅ Admin '${admin.username}' created/updated`);
    }

    // Seed Deposit Wallets
    console.log('\n💰 Seeding Deposit Wallets...');
    for (const wallet of seedData.depositWallets) {
      await DepositWallet.findOneAndUpdate(
        { network: wallet.network },
        wallet,
        { upsert: true, new: true }
      );
      console.log(`   ✅ ${wallet.network} wallet created/updated`);
    }

    // Seed Trading Levels
    console.log('\n📊 Seeding Trading Levels...');
    for (const level of seedData.tradingLevels) {
      await TradingLevel.findOneAndUpdate(
        { level: level.level },
        level,
        { upsert: true, new: true }
      );
      console.log(`   ✅ Level ${level.level} (${level.name}) created/updated`);
    }

    // Seed Currencies
    console.log('\n💱 Seeding Currencies...');
    for (const currency of seedData.currencies) {
      await Currency.findOneAndUpdate(
        { symbol: currency.symbol },
        currency,
        { upsert: true, new: true }
      );
      console.log(`   ✅ ${currency.symbol} created/updated`);
    }

    // Seed Networks
    console.log('\n🌐 Seeding Networks...');
    for (const network of seedData.networks) {
      await Network.findOneAndUpdate(
        { symbol: network.symbol },
        network,
        { upsert: true, new: true }
      );
      console.log(`   ✅ ${network.symbol} network created/updated`);
    }

    // Seed Exchange Rates
    console.log('\n📈 Seeding Exchange Rates...');
    for (const rate of seedData.exchangeRates) {
      await ExchangeRate.findOneAndUpdate(
        { from: rate.from, to: rate.to },
        rate,
        { upsert: true, new: true }
      );
      console.log(`   ✅ ${rate.from}/${rate.to} = ${rate.rate}`);
    }

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('='.repeat(50));
    console.log('Login Credentials:');
    console.log('='.repeat(50));
    console.log('Master Account:');
    console.log('  Username: master');
    console.log('  Password: (set via MASTER_PASSWORD env var)');
    console.log('\nAdmin Account:');
    console.log('  Username:', process.env.SEED_ADMIN_USERNAME || 'aqiang');
    console.log('  Password: (set via SEED_ADMIN_PASSWORD env var)');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run seed
seed();
