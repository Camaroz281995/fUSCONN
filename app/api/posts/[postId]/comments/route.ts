import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params
    const posts = await storage.posts.getAll()
    const post = posts.find(p => p.id === postId)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post.comments)
  } catch (error) {
    console.error("Error getting comments:", error)
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { username, content } = await request.json()
    const { postId } = await params

    if (!username || !content) {
      return NextResponse.json({ error: "Username and content required" }, { status: 400 })
    }

    const newComment = {
      id: Date.now().toString(),
      username,
      content,
      createdAt: Date.now(),
    }

    await storage.posts.addComment(postId, newComment)
    
    const posts = await storage.posts.getAll()
    const post = posts.find(p => p.id === postId)

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
