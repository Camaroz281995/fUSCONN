import { type NextRequest, NextResponse } from "next/server"
import { generateId } from "@/lib/utils"

// Maximum file size: 3MB (reduced from 5MB)
const MAX_FILE_SIZE = 3 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Check content length header first to avoid processing large files
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File is too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)` }, { status: 413 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const username = formData.get("username") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Double check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File is too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)` }, { status: 413 })
    }

    // Generate a unique filename
    const fileId = generateId()
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFileName = `${username}-${fileId}-${fileName}`

    // Create a mock URL for development
    const mockPhotoUrl = `/mock-photos/${uniqueFileName}`

    return NextResponse.json({
      url: mockPhotoUrl,
      success: true,
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
