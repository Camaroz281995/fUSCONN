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
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await getSql()`
      SELECT username FROM users WHERE username = ${username}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      )
    }

    // Create user with unique ID and timestamp
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const createdAt = Date.now()

    await getSql()`
      INSERT INTO users (id, username, password, created_at)
      VALUES (${userId}, ${username}, ${password}, ${createdAt})
    `

    return NextResponse.json(
      { 
        success: true,
        message: "Account created successfully",
        username 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
