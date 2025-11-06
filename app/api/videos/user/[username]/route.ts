import { kv } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch videos for a user
export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const username = params.username

    // Get all video IDs for this user
    const videoIds = (await kv.smembers(`user:${username}:videos`)) as string[]

    if (!videoIds || videoIds.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    // Get all videos with their data
    const videosPromises = videoIds.map(async (id) => {
      return await kv.get(`video:${id}`)
    })

    const videos = await Promise.all(videosPromises)

    // Filter out any null videos and sort by timestamp (newest first)
    const validVideos = videos.filter(Boolean).sort((a: any, b: any) => b.timestamp - a.timestamp)

    return NextResponse.json({ videos: validVideos })
  } catch (error) {
    console.error("Error fetching user videos:", error)
    return NextResponse.json({ error: "Failed to fetch user videos" }, { status: 500 })
  }
}
