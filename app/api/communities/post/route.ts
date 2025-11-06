import { sql } from "@vercel/postgres"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, communityId, author, title, content, upvotes, downvotes, comments, timestamp } = body

    await sql`
      INSERT INTO community_posts (
        id, community_id, author, title, content, 
        upvotes, downvotes, comments, timestamp
      ) VALUES (
        ${id}, ${communityId}, ${author}, ${title}, ${content},
        ${JSON.stringify(upvotes)}, ${JSON.stringify(downvotes)}, ${comments}, ${timestamp}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
