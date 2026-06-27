-- ImsooRich Tools — Cloudflare D1 schema
-- Create database: wrangler d1 create imsoorich-tools
-- Apply: wrangler d1 execute imsoorich-tools --remote --file=cloudflare/d1-schema.sql

CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  tags TEXT NOT NULL DEFAULT '[]',
  downloads TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS tools_updated_at_idx ON tools (updated_at DESC);

-- Public tool requests submitted from the marketplace
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS requests_created_at_idx ON requests (created_at DESC);
