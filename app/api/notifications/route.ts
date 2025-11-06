import { type NextRequest, NextResponse } from "next/server"
import { persistentStorage } from "@/lib/persistent-storage"
import { generateId } from "@/lib/utils"
import type { Notification } from "@/lib/types"

// GET: Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const notifications = persistentStorage.getUserNotifications(username)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// POST: Create a new notification
export async function POST(request: NextRequest) {
  try {
    const { type, username, targetUsername, content, postId, commentId } = await request.json()

    // Validate input
    if (!type || !username || !targetUsername || !content) {
      return NextResponse.json({ error: "Type, username, targetUsername, and content are required" }, { status: 400 })
    }

    // Create a new notification
    const id = generateId()
    const timestamp = Date.now()

    const notification: Notification = {
      id,
      type,
      username,
      targetUsername,
      content,
      postId,
      commentId,
      read: false,
      timestamp,
    }

    // Save the notification
    persistentStorage.saveNotification(notification)

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
