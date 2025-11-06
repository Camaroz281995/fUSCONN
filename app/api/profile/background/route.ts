import { type NextRequest, NextResponse } from "next/server"
import { generateId } from "@/lib/utils"
import { persistentStorage } from "@/lib/persistent-storage"

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

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File is too large (max ${maxSize / (1024 * 1024)}MB)` }, { status: 400 })
    }

    // Generate a unique filename
    const fileId = generateId()
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const mockPhotoUrl = `/mock-backgrounds/${username}-${fileId}-${fileName}`

    console.log("Generated background photo URL:", mockPhotoUrl)

    // Create a data URL from the file for immediate display
    const reader = new FileReader()
    const dataUrlPromise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })

    // Process in parallel for speed
    const [dataUrl] = await Promise.all([
      dataUrlPromise,
      // Save to persistent storage (this can happen in parallel)
      persistentStorage.saveUserBackgroundPhoto(username, mockPhotoUrl),
    ])

    return NextResponse.json({
      url: dataUrl, // Use data URL for immediate display
      success: true,
    })
  } catch (error) {
    console.error("Error uploading background photo:", error)
    return NextResponse.json({ error: "Failed to upload background photo" }, { status: 500 })
  }
}
