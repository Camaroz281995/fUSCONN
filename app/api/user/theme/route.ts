import { type NextRequest, NextResponse } from "next/server"
import { persistentStorage } from "@/lib/persistent-storage"

// GET: Get user theme
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const theme = persistentStorage.getUserTheme(username)

    return NextResponse.json({ theme })
  } catch (error) {
    console.error("Error getting user theme:", error)
    return NextResponse.json({ error: "Failed to get user theme" }, { status: 500 })
  }
}

// POST: Set user theme
export async function POST(request: NextRequest) {
  try {
    const { username, theme } = await request.json()

    if (!username || !theme) {
      return NextResponse.json({ error: "Username and theme are required" }, { status: 400 })
    }

    // Validate theme
    const validThemes = ["light", "dark", "retro", "cyberpunk"]
    if (!validThemes.includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
    }

    persistentStorage.saveUserTheme(username, theme)

    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error("Error setting user theme:", error)
    return NextResponse.json({ error: "Failed to set user theme" }, { status: 500 })
  }
}
