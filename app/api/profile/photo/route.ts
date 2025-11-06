import { type NextRequest, NextResponse } from "next/server"
import { generateId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const username = formData.get("username") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // In development mode without Vercel Blob, create a mock URL
    const mockPhotoUrl = `/mock-photos/${username}-${generateId()}.jpg`

    return NextResponse.json({
      url: mockPhotoUrl,
      success: true,
    })
  } catch (error) {
    console.error("Error uploading profile photo:", error)
    return NextResponse.json({ error: "Failed to upload profile photo" }, { status: 500 })
  }
}
