import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const { postId, username, voteType } = await request.json()

    if (voteType === "upvote") {
      await storage.communities.vote(postId, username, 'up')
    } else if (voteType === "downvote") {
      await storage.communities.vote(postId, username, 'down')
    }

    const communities = await storage.communities.getAll()
    let post = null
    for (const community of communities) {
      const posts = await storage.communities.getPosts(community.id)
      post = posts.find(p => p.id === postId)
      if (post) break
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error voting on post:", error)
    return NextResponse.json({ error: "Failed to vote on post" }, { status: 500 })
  }
}
