import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const getSql = () => {
  const connectionString = process.env.fusconn_DATABASE_URL || process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('Database connection string is not configured')
  }

  return neon(connectionString)
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Find user
    const users = await getSql()`
      SELECT username, password, bio, profile_photo AS photo_url
      FROM users
      WHERE username = ${username}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check password (Note: In production, use bcrypt.compare())
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        username: user.username,
        bio: user.bio,
        photo_url: user.photo_url
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
