export const runtime = "edge"

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

const pets = new Map<string, Pet>()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get("owner")

    if (!owner) {
      return NextResponse.json({ error: "Owner required" }, { status: 400 })
    }

    const userPets = Array.from(pets.values())
      .filter((pet) => pet.owner === owner)
      .sort((a, b) => b.createdAt - a.createdAt)

    return NextResponse.json({ pets: userPets })
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

    const newPet: Pet = {
      id: `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      owner,
      hunger: 100,
      happiness: 100,
      energy: 100,
      level: 1,
      experience: 0,
      lastFed: Date.now(),
      lastPlayed: Date.now(),
      createdAt: Date.now(),
    }

    pets.set(newPet.id, newPet)

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

    const pet = pets.get(petId)

    if (!pet || pet.owner !== owner) {
      return NextResponse.json({ error: "Pet not found or unauthorized" }, { status: 404 })
    }

    if (action === "feed") {
      pet.hunger = Math.min(100, pet.hunger + 30)
      pet.experience += 10
      pet.level = Math.floor(pet.experience / 100) + 1
      pet.lastFed = Date.now()
    } else if (action === "play") {
      if (pet.energy >= 20) {
        pet.happiness = Math.min(100, pet.happiness + 25)
        pet.energy = Math.max(0, pet.energy - 20)
        pet.experience += 15
        pet.level = Math.floor(pet.experience / 100) + 1
        pet.lastPlayed = Date.now()
      } else {
        return NextResponse.json({ error: "Pet is too tired" }, { status: 400 })
      }
    } else if (action === "pet") {
      pet.happiness = Math.min(100, pet.happiness + 10)
      pet.experience += 5
      pet.level = Math.floor(pet.experience / 100) + 1
    }

    pets.set(petId, pet)

    return NextResponse.json({ pet })
  } catch (error) {
    console.error("Error updating pet:", error)
    return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
  }
}
