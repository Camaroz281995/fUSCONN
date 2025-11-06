import { sql } from "@vercel/postgres"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { communityId, username } = await request.json()

    // Get current community
    const { rows } = await sql`
      SELECT members, member_count FROM communities WHERE id = ${communityId}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    const members = rows[0].members || []
    if (!members.includes(username)) {
      members.push(username)

      await sql`
        UPDATE communities 
        SET members = ${JSON.stringify(members)}, 
            member_count = ${members.length}
        WHERE id = ${communityId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining community:", error)
    return NextResponse.json({ error: "Failed to join community" }, { status: 500 })
  }
}
