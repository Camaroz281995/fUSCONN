import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: Request, { params }: { params: { communityId: string } }) {
  try {
    const { username } = await request.json()
    const community = storage.communities.get(params.communityId)

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    // Toggle membership
    if (community.members.includes(username)) {
      community.members = community.members.filter((m) => m !== username)
    } else {
      community.members.push(username)
    }

    storage.communities.set(params.communityId, community)

    return NextResponse.json(community)
  } catch (error) {
    console.error("Error joining community:", error)
    return NextResponse.json({ error: "Failed to join community" }, { status: 500 })
  }
}
