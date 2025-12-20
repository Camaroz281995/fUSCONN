import { kv } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch videos for a user
export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    const videoKeys = await kv.keys("videos:*")
    const videos = []

    for (const key of videoKeys) {
      const video = await kv.get(key)
      if (video && video.username === username) {
        videos.push(video)
      }
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching user videos:", error)
    return NextResponse.json({ error: "Failed to fetch user videos" }, { status: 500 })
  }
}
