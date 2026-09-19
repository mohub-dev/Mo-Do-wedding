-- Cloudflare D1 Migration: 0001_initial.sql
-- Designed strictly from existing application models (RSVP, Guestbook, Batch Guests, Wedding Settings)

-- 1. RSVPs Table
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('attending', 'declined')),
  companion_count INTEGER NOT NULL DEFAULT 0,
  note TEXT DEFAULT '',
  submitted_at TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Guestbook Messages Table
CREATE TABLE IF NOT EXISTS guestbook (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  relation TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 1,
  created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Guests List Table (Batch Guest Dispatcher)
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  sent INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Wedding Settings Table (Live Event Editor)
CREATE TABLE IF NOT EXISTS wedding_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
