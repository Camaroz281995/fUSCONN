# fUSCONN - Social Connection Platform

A modern social media platform built with Next.js, featuring communities, messaging, marketplace, and more.

## Database Setup

This application uses Neon PostgreSQL. Follow these steps to set up the database:

### 1. Run Migration Scripts

Execute the SQL migration script to create all necessary tables:

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `scripts/001-initial-setup.sql`
4. Run the script

This will create all the necessary tables:
- user_profiles
- posts
- comments
- videos
- communities
- community_members
- community_posts
- chats
- chat_messages
- friend_requests
- notifications
- virtual_pets
- marketplace_listings
- live_streams

### 2. Environment Variables

Make sure you have the following environment variables set in your Vercel project:

\`\`\`
fusconn_DATABASE_URL=your_neon_database_url
fusconn_POSTGRES_URL=your_neon_postgres_url
\`\`\`

## Features

- 🏠 **Home Feed** - View posts from users
- 👥 **Communities** - Create and join interest-based groups
- 💬 **Messaging** - Real-time chat with friends
- 📹 **Videos** - Share and watch video content
- 🐾 **Virtual Pets** - Adopt and care for digital pets
- 🛍️ **Marketplace** - Buy and sell items
- 📺 **Live Streaming** - Broadcast live content
- 👤 **Profile** - Customize your profile and background

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Neon PostgreSQL
- Tailwind CSS
- shadcn/ui components

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000)

## License

MIT
