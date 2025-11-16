export const runtime = "edge"

import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

interface MarketplaceListing {
  id: string
  title: string
  description: string
  price: number
  category: string
  location: string
  imageUrl: string
  sellerUsername: string
  timestamp: number
  contactEmail: string | null
  contactPhone: string | null
  status: string
}

const listings = new Map<string, MarketplaceListing>()

export async function GET() {
  try {
    const allListings = Array.from(listings.values())
      .filter((listing) => listing.status === "active")
      .sort((a, b) => b.timestamp - a.timestamp)

    return NextResponse.json({ listings: allListings })
  } catch (error) {
    console.error("Error fetching marketplace listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, price, category, location, imageUrl, sellerUsername, contactEmail, contactPhone } =
      body

    if (!title || !price || !category || !sellerUsername) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newListing: MarketplaceListing = {
      id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || "",
      price: Number.parseFloat(price),
      category,
      location: location || "",
      imageUrl: imageUrl || "",
      sellerUsername,
      timestamp: Date.now(),
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      status: "active",
    }

    listings.set(newListing.id, newListing)

    return NextResponse.json({ listing: newListing })
  } catch (error) {
    console.error("Error creating marketplace listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
