import { sql } from "@vercel/postgres"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, creator, members, memberCount, isPrivate, category, createdAt } = body

    await sql`
      INSERT INTO communities (
        id, name, description, creator, members, member_count, 
        is_private, category, created_at
      ) VALUES (
        ${id}, ${name}, ${description}, ${creator}, ${JSON.stringify(members)}, 
        ${memberCount}, ${isPrivate}, ${category}, ${createdAt}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating community:", error)
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 })
  }
}
