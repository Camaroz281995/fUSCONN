import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    const communities = storage.communities.getByUser(params.username)
    return NextResponse.json(communities)
  } catch (error) {
    console.error("Error getting user communities:", error)
    return NextResponse.json({ error: "Failed to get user communities" }, { status: 500 })
  }
}
