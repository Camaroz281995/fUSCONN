import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }

  try {
    // Get all communities where user is a member
    const communities = await sql`
      SELECT 
        pc.id,
        pc.name,
        pc.description,
        pc.creator,
        pc.is_private,
        pc.tags,
        pc.created_at,
        COALESCE(
          json_agg(DISTINCT pcm.username) FILTER (WHERE pcm.username IS NOT NULL),
          '[]'::json
        ) as members
      FROM profile_communities pc
      LEFT JOIN profile_community_members pcm ON pc.id = pcm.community_id
      WHERE pc.creator = ${username} OR pcm.username = ${username}
      GROUP BY pc.id, pc.name, pc.description, pc.creator, pc.is_private, pc.tags, pc.created_at
      ORDER BY pc.created_at DESC
    `

    return NextResponse.json({ 
      communities: communities.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        creator: c.creator,
        isPrivate: c.is_private,
        tags: c.tags || [],
        createdAt: Number(c.created_at),
        members: c.members || []
      }))
    })
  } catch (error) {
    console.error('Error fetching communities:', error)
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const community = await request.json()

    await sql`
      INSERT INTO profile_communities (id, name, description, creator, is_private, tags, created_at)
      VALUES (
        ${community.id},
        ${community.name},
        ${community.description},
        ${community.creator},
        ${community.isPrivate},
        ${JSON.stringify(community.tags)},
        ${community.createdAt}
      )
    `

    // Add creator as first member
    await sql`
      INSERT INTO profile_community_members (community_id, username)
      VALUES (${community.id}, ${community.creator})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating community:', error)
    return NextResponse.json({ error: 'Failed to create community' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Community ID required' }, { status: 400 })
  }

  try {
    // Delete members first
    await sql`DELETE FROM profile_community_members WHERE community_id = ${id}`
    
    // Delete community
    await sql`DELETE FROM profile_communities WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting community:', error)
    return NextResponse.json({ error: 'Failed to delete community' }, { status: 500 })
  }
}
