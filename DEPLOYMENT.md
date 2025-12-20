# fUSCONN Deployment Guide

## Prerequisites

1. A Vercel account
2. A Neon database (already connected)

## Deployment Steps

### 1. Create Database Tables

Before deploying, you need to run the database migration script to create all the necessary tables.

In the v0 interface:
1. Go to the Scripts section
2. Run `scripts/01-create-tables.sql`
3. Run `scripts/02-add-webrtc-table.sql` (if it exists)

This will create all the tables needed for:
- Users
- Posts and comments
- Videos
- Communities
- Chats and messages
- Marketplace listings
- Virtual pets
- Call history
- WebRTC signaling

### 2. Verify Environment Variables

Make sure these environment variables are set in your Vercel project:
- `fusconn_DATABASE_URL` - Your Neon database connection string

### 3. Deploy to Vercel

Click the "Publish" button in the top right of v0, or:
1. Push to GitHub
2. Import the repository in Vercel
3. Deploy

## Features

### What Everyone Can See:
- ✅ Posts - All users see the same posts feed
- ✅ Videos - Shared video library
- ✅ Communities - Public communities everyone can join
- ✅ Marketplace - All listings visible to everyone
- ✅ Live Streaming - Public live streams
- ✅ Virtual Pets - See all adopted pets

### User-Specific Features:
- ✅ Chats - Direct messaging between users
- ✅ Calls - WebRTC video/voice calling
- ✅ Profile - Personal profile with custom backgrounds
- ✅ My Pets - Your adopted virtual pets

## Troubleshooting

If deployment fails:
1. Check that database tables are created
2. Verify environment variables are set
3. Check the Vercel deployment logs for specific errors

## Technical Details

- **Framework**: Next.js 15 with App Router
- **Database**: Neon PostgreSQL
- **Storage**: All data is stored in the database for real-time sharing
- **Real-time**: WebRTC for peer-to-peer video calling
- **Styling**: Tailwind CSS + shadcn/ui
