import { NextRequest, NextResponse } from "next/server"
import { webrtcStorage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { from, to, signal, type } = await request.json()

    if (!from || !to || !signal || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const signalData = {
      from,
      to,
      signal,
      type,
      timestamp: Date.now(),
    }

    await webrtcStorage.saveSignal(to, signalData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving signal:", error)
    return NextResponse.json({ error: "Failed to save signal" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const signals = await webrtcStorage.getSignals(username)
    
    await webrtcStorage.clearSignals(username)

    return NextResponse.json({ signals })
  } catch (error) {
    console.error("Error retrieving signals:", error)
    return NextResponse.json({ error: "Failed to retrieve signals" }, { status: 500 })
  }
}
