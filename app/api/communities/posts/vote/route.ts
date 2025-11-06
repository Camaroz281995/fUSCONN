import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const { postId, username, voteType } = await request.json()
    const post = storage.communityPosts.get(postId)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (voteType === "upvote") {
      // Remove from downvotes if present
      post.downvotes = post.downvotes.filter((u) => u !== username)

      // Toggle upvote
      if (post.upvotes.includes(username)) {
        post.upvotes = post.upvotes.filter((u) => u !== username)
      } else {
        post.upvotes.push(username)
      }
    } else if (voteType === "downvote") {
      // Remove from upvotes if present
      post.upvotes = post.upvotes.filter((u) => u !== username)

      // Toggle downvote
      if (post.downvotes.includes(username)) {
        post.downvotes = post.downvotes.filter((u) => u !== username)
      } else {
        post.downvotes.push(username)
      }
    }

    storage.communityPosts.set(postId, post)

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error voting on post:", error)
    return NextResponse.json({ error: "Failed to vote on post" }, { status: 500 })
  }
}
