import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: { postId: string } }) {
  try {
    const post = storage.posts.get(params.postId)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post.comments)
  } catch (error) {
    console.error("Error getting comments:", error)
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  try {
    const { username, content } = await request.json()
    const post = storage.posts.get(params.postId)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const newComment = {
      id: Date.now().toString(),
      username,
      content,
      createdAt: Date.now(),
    }

    post.comments.push(newComment)
    storage.posts.set(params.postId, post)

    return NextResponse.json(newComment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
