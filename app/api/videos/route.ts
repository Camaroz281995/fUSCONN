import { kv } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch all videos
export async function GET() {
  try {
    const videoKeys = await kv.keys('videos:*')
    const videos = []
    
    for (const key of videoKeys) {
      const video = await kv.get(key)
      if (video) videos.push(video)
    }
    
    // Sort by createdAt descending
    videos.sort((a, b) => b.createdAt - a.createdAt)
    
    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

// POST: Create new video
export async function POST(request: NextRequest) {
  try {
    const { username, title, description, videoUrl, thumbnailUrl } = await request.json()

    if (!username || !title || !videoUrl) {
      return NextResponse.json({ error: "Username, title, and video URL are required" }, { status: 400 })
    }

    const id = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const video = {
      id,
      username,
      title,
      description: description || '',
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      createdAt: Date.now(),
      likes: [],
      comments: [],
    }

    await kv.set(`videos:${id}`, video)

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
