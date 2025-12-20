import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { username } = await request.json()
    const { postId } = await params
    
    await storage.posts.like(postId, username)
    
    const posts = await storage.posts.getAll()
    const post = posts.find(p => p.id === postId)

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}
