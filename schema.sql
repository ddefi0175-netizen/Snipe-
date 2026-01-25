-- Cloudflare D1 Database Schema for Snipe Chat System
-- Run this with: wrangler d1 execute <DATABASE_NAME> --file=schema.sql

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    sender_name TEXT DEFAULT 'User',
    sender_wallet TEXT,
    sender_type TEXT DEFAULT 'user', -- 'user' or 'admin'
    created_at INTEGER NOT NULL, -- Unix timestamp in milliseconds
    delivered BOOLEAN DEFAULT 0,
    read BOOLEAN DEFAULT 0
);

-- Active Chats Table (for admin dashboard)
CREATE TABLE IF NOT EXISTS active_chats (
    session_id TEXT PRIMARY KEY,
    user_name TEXT,
    user_wallet TEXT,
    last_message TEXT,
    last_message_time INTEGER NOT NULL,
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'resolved', 'archived'
    updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_updated ON active_chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_status ON active_chats(status, updated_at DESC);

-- Admin Users Table (optional - for future JWT auth)
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- bcrypt hash
    role TEXT DEFAULT 'admin', -- 'admin' or 'master'
    email TEXT,
    created_at INTEGER NOT NULL,
    last_login INTEGER
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
