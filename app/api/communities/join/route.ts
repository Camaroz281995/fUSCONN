import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { communityId, username } = await request.json()

    const community = storage.communities.get(communityId)

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    if (!community.members.includes(username)) {
      community.members.push(username)
      storage.communities.set(communityId, community)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining community:", error)
    return NextResponse.json({ error: "Failed to join community" }, { status: 500 })
  }
}
