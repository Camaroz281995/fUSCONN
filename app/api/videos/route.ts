import { kv } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"
import type { UserVideo } from "@/lib/types"
import { generateId } from "@/lib/utils"

// POST: Save video metadata
export async function POST(request: NextRequest) {
  try {
    const { username, title, description, url } = await request.json()

    // Validate input
    if (!username || !title || !url) {
      return NextResponse.json({ error: "Username, title, and URL are required" }, { status: 400 })
    }

    // Create a new video entry
    const id = generateId()
    const timestamp = Date.now()

    const video: UserVideo = {
      id,
      username,
      title,
      description: description || "",
      url,
      timestamp,
    }

    // Save the video metadata
    await kv.set(`video:${id}`, video)
    await kv.sadd(`user:${username}:videos`, id)

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error("Error saving video:", error)
    return NextResponse.json({ error: "Failed to save video" }, { status: 500 })
  }
}
