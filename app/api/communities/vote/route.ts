import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { postId, username, voteType } = await request.json()

    const post = storage.communityPosts.get(postId)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (voteType === "up") {
      if (post.upvotes.includes(username)) {
        post.upvotes = post.upvotes.filter((u) => u !== username)
      } else {
        post.upvotes.push(username)
        post.downvotes = post.downvotes.filter((u) => u !== username)
      }
    } else {
      if (post.downvotes.includes(username)) {
        post.downvotes = post.downvotes.filter((u) => u !== username)
      } else {
        post.downvotes.push(username)
        post.upvotes = post.upvotes.filter((u) => u !== username)
      }
    }

    storage.communityPosts.set(postId, post)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}
