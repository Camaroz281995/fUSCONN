import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM communities 
      ORDER BY member_count DESC, created_at DESC
    `

    const communities = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      creator: row.creator,
      members: row.members || [],
      memberCount: row.member_count || 0,
      isPrivate: row.is_private || false,
      category: row.category || "general",
      createdAt: row.created_at,
    }))

    return NextResponse.json({ communities })
  } catch (error) {
    console.error("Error fetching communities:", error)
    return NextResponse.json({ communities: [] }, { status: 500 })
  }
}
