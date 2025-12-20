-- Create all tables for fUSCONN
-- This ensures everyone sees the same data

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  background_url TEXT,
  background_blur INTEGER DEFAULT 0,
  background_opacity INTEGER DEFAULT 100,
  background_brightness INTEGER DEFAULT 100,
  created_at BIGINT NOT NULL
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  gif_url TEXT,
  created_at BIGINT NOT NULL
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  post_id TEXT NOT NULL,
  username TEXT NOT NULL,
  PRIMARY KEY (post_id, username)
);

-- Post dislikes
CREATE TABLE IF NOT EXISTS post_dislikes (
  post_id TEXT NOT NULL,
  username TEXT NOT NULL,
  PRIMARY KEY (post_id, username)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at BIGINT NOT NULL
);

-- Video likes
CREATE TABLE IF NOT EXISTS video_likes (
  video_id TEXT NOT NULL,
  username TEXT NOT NULL,
  PRIMARY KEY (video_id, username)
);

-- Video comments
CREATE TABLE IF NOT EXISTS video_comments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  creator TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Community members
CREATE TABLE IF NOT EXISTS community_members (
  community_id TEXT NOT NULL,
  username TEXT NOT NULL,
  PRIMARY KEY (community_id, username)
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Community post votes
CREATE TABLE IF NOT EXISTS community_post_votes (
  post_id TEXT NOT NULL,
  username TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  PRIMARY KEY (post_id, username)
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user1 TEXT NOT NULL,
  user2 TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Marketplace listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY,
  seller TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at BIGINT NOT NULL
);

-- Virtual pets
CREATE TABLE IF NOT EXISTS virtual_pets (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  hunger INTEGER DEFAULT 100,
  happiness INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL
);

-- Call history
CREATE TABLE IF NOT EXISTS call_history (
  id TEXT PRIMARY KEY,
  caller TEXT NOT NULL,
  recipient TEXT NOT NULL,
  call_type TEXT NOT NULL,
  duration INTEGER,
  created_at BIGINT NOT NULL
);

-- WebRTC signals table for peer-to-peer calling
CREATE TABLE IF NOT EXISTS webrtc_signals (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  signal_data TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
