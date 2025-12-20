import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    const communities = storage.communities.getAll()

    return NextResponse.json({ communities })
  } catch (error) {
    console.error("Error fetching communities:", error)
    return NextResponse.json({ communities: [] }, { status: 500 })
  }
}
