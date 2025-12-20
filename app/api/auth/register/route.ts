import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const existingUser = await storage.users.get(username)
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      password, // In production, this should be hashed
      bio: "",
      photoUrl: "/placeholder.svg?height=100&width=100",
      createdAt: Date.now(),
    }

    await storage.users.set(username, newUser)

    return NextResponse.json({ success: true, user: { username, id: newUser.id } })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
