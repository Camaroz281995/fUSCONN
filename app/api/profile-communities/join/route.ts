import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { communityId, username } = await request.json()

    if (!communityId || !username) {
      return NextResponse.json({ error: 'Community ID and username required' }, { status: 400 })
    }

    // Check if already a member
    const existing = await sql`
      SELECT * FROM profile_community_members 
      WHERE community_id = ${communityId} AND username = ${username}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Add member
    await sql`
      INSERT INTO profile_community_members (community_id, username)
      VALUES (${communityId}, ${username})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining community:', error)
    return NextResponse.json({ error: 'Failed to join community' }, { status: 500 })
  }
}
