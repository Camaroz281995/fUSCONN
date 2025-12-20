import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

interface Pet {
  id: string
  name: string
  type: string
  owner: string
  hunger: number
  happiness: number
  energy: number
  level: number
  experience: number
  lastFed: number
  lastPlayed: number
  createdAt: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")

    if (!owner) {
      return NextResponse.json({ error: "Owner required" }, { status: 400 })
    }

    const pets = await storage.pets.getByOwner(owner)

    return NextResponse.json({ pets })
  } catch (error) {
    console.error("Error fetching pets:", error)
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, owner } = body

    if (!name || !type || !owner) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newPet = await storage.pets.create({
      name,
      type,
      owner,
    })

    return NextResponse.json({ pet: newPet })
  } catch (error) {
    console.error("Error creating pet:", error)
    return NextResponse.json({ error: "Failed to create pet" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { petId, owner, action } = body

    if (!petId || !owner || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const pet = await storage.pets.update(petId, owner, action)

    if (!pet) {
      return NextResponse.json({ error: "Pet not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ pet })
  } catch (error) {
    console.error("Error updating pet:", error)
    return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
  }
}
