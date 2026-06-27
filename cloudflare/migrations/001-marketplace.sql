-- Migration: add marketplace features to an existing database
-- Apply: wrangler d1 execute imsoorich-tools --remote --file=cloudflare/migrations/001-marketplace.sql

ALTER TABLE tools ADD COLUMN status TEXT NOT NULL DEFAULT 'available';

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS requests_created_at_idx ON requests (created_at DESC);
