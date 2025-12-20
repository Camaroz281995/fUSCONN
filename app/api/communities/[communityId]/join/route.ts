import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { username } = await request.json()
    const { communityId } = await params

    await storage.communities.join(communityId, username)
    
    const communities = await storage.communities.getAll()
    const community = communities.find(c => c.id === communityId)

    return NextResponse.json(community)
  } catch (error) {
    console.error("Error joining community:", error)
    return NextResponse.json({ error: "Failed to join community" }, { status: 500 })
  }
}
