import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    const posts = storage.posts.getAll()
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error getting posts:", error)
    return NextResponse.json({ error: "Failed to get posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { username, content, imageUrl, videoUrl, gifUrl } = await request.json()

    if (!username || !content) {
      return NextResponse.json({ error: "Username and content required" }, { status: 400 })
    }

    const newPost = {
      id: Date.now().toString(),
      username,
      content,
      imageUrl,
      videoUrl,
      gifUrl,
      createdAt: Date.now(),
      likes: [],
      dislikes: [],
      comments: [],
    }

    storage.posts.set(newPost.id, newPost)

    return NextResponse.json(newPost)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
