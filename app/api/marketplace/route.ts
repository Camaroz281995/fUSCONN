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

export async function GET() {
  try {
    const listings = await storage.marketplace.getAll()

    return NextResponse.json({ listings })
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

    const newListing = await storage.marketplace.create({
      title,
      description: description || "",
      price: Number.parseFloat(price),
      category,
      location: location || "",
      imageUrl: imageUrl || "",
      sellerUsername,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
    })

    return NextResponse.json({ listing: newListing })
  } catch (error) {
    console.error("Error creating marketplace listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
