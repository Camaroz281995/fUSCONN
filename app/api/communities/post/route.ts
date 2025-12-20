import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, communityId, username, content } = body

    const communityPost = {
      id,
      communityId,
      username,
      content,
      createdAt: Date.now(),
      upvotes: [],
      downvotes: [],
    }

    storage.communityPosts.set(id, communityPost)

    return NextResponse.json({ success: true, post: communityPost })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
