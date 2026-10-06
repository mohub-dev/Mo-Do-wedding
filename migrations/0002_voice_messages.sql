CREATE TABLE IF NOT EXISTS voice_messages (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_voice_messages_created_at ON voice_messages(created_timestamp DESC);
