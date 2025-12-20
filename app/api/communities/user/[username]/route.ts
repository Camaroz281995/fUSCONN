import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    const allCommunities = await storage.communities.getAll()
    const userCommunities = allCommunities.filter(c => c.members.includes(username))
    return NextResponse.json(userCommunities)
  } catch (error) {
    console.error("Error getting user communities:", error)
    return NextResponse.json({ error: "Failed to get user communities" }, { status: 500 })
  }
}
