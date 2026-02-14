-- fUSCONN initial database setup
-- This migration creates the tables currently used by API routes.

BEGIN;

-- Users table used by app/api/auth/signup/route.ts
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  full_name VARCHAR(255),
  profile_photo TEXT,
  bio TEXT,
  last_login BIGINT,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Profile communities used by app/api/profile-communities/*
CREATE TABLE IF NOT EXISTS profile_communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile_community_members (
  community_id TEXT NOT NULL REFERENCES profile_communities(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  PRIMARY KEY (community_id, username)
);

CREATE INDEX IF NOT EXISTS idx_profile_communities_creator ON profile_communities(creator);
CREATE INDEX IF NOT EXISTS idx_profile_communities_created_at ON profile_communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_community_members_username ON profile_community_members(username);

COMMIT;
