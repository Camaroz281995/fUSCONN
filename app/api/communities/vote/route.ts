import { sql } from "@vercel/postgres"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { postId, username, voteType } = await request.json()

    const { rows } = await sql`
      SELECT upvotes, downvotes FROM community_posts WHERE id = ${postId}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    let upvotes = rows[0].upvotes || []
    let downvotes = rows[0].downvotes || []

    if (voteType === "up") {
      if (upvotes.includes(username)) {
        upvotes = upvotes.filter((u: string) => u !== username)
      } else {
        upvotes.push(username)
        downvotes = downvotes.filter((u: string) => u !== username)
      }
    } else {
      if (downvotes.includes(username)) {
        downvotes = downvotes.filter((u: string) => u !== username)
      } else {
        downvotes.push(username)
        upvotes = upvotes.filter((u: string) => u !== username)
      }
    }

    await sql`
      UPDATE community_posts 
      SET upvotes = ${JSON.stringify(upvotes)}, 
          downvotes = ${JSON.stringify(downvotes)}
      WHERE id = ${postId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}
