import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  try {
    const { username } = await request.json()
    const post = storage.posts.get(params.postId)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Remove from dislikes if present
    post.dislikes = post.dislikes.filter((u) => u !== username)

    // Toggle like
    if (post.likes.includes(username)) {
      post.likes = post.likes.filter((u) => u !== username)
    } else {
      post.likes.push(username)
    }

    storage.posts.set(params.postId, post)

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}
