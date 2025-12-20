import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { communityId } = await params
    const posts = await storage.communities.getPosts(communityId)
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error getting community posts:", error)
    return NextResponse.json({ error: "Failed to get community posts" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { username, content } = await request.json()
    const { communityId } = await params

    if (!username || !content) {
      return NextResponse.json({ error: "Username and content required" }, { status: 400 })
    }

    const newPost = {
      id: Date.now().toString(),
      communityId,
      username,
      content,
      createdAt: Date.now(),
      upvotes: [],
      downvotes: [],
    }

    await storage.communities.addPost(newPost)

    return NextResponse.json(newPost)
  } catch (error) {
    console.error("Error creating community post:", error)
    return NextResponse.json({ error: "Failed to create community post" }, { status: 500 })
  }
}
