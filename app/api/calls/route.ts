import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

interface CallHistory {
  id: string
  caller: string
  recipient: string
  type: "voice" | "video"
  duration: number
  timestamp: number
  status: "completed" | "missed" | "declined"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const calls = await storage.calls.getByUser(username)

    return NextResponse.json({ calls })
  } catch (error) {
    console.error("Error fetching call history:", error)
    return NextResponse.json({ error: "Failed to fetch call history" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { caller, recipient, type, duration, status } = body

    if (!caller || !recipient || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newCall = await storage.calls.create({
      caller,
      recipient,
      type,
      duration: duration || 0,
      status: status || "completed",
    })

    return NextResponse.json({ call: newCall })
  } catch (error) {
    console.error("Error creating call:", error)
    return NextResponse.json({ error: "Failed to create call" }, { status: 500 })
  }
}
