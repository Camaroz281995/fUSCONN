import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, creator } = body

    const community = {
      id,
      name,
      description,
      creator,
      members: [creator],
      createdAt: Date.now(),
    }

    storage.communities.set(id, community)

    return NextResponse.json({ success: true, community })
  } catch (error) {
    console.error("Error creating community:", error)
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 })
  }
}
