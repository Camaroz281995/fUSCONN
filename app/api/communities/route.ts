import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    const communities = storage.communities.getAll()
    return NextResponse.json(communities)
  } catch (error) {
    console.error("Error getting communities:", error)
    return NextResponse.json({ error: "Failed to get communities" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, creator } = await request.json()

    if (!name || !creator) {
      return NextResponse.json({ error: "Name and creator required" }, { status: 400 })
    }

    const newCommunity = {
      id: Date.now().toString(),
      name,
      description: description || "",
      creator,
      members: [creator],
      createdAt: Date.now(),
    }

    storage.communities.set(newCommunity.id, newCommunity)

    return NextResponse.json(newCommunity)
  } catch (error) {
    console.error("Error creating community:", error)
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 })
  }
}
