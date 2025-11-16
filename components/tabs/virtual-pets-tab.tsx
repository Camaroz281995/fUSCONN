"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PawPrint, Heart, Sparkles, Apple, Gamepad2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

interface VirtualPetsTabProps {
  username: string
}

export default function VirtualPetsTab({ username }: VirtualPetsTabProps) {
  const [pets, setPets] = useState<Pet[]>([])
  const [showAdoptDialog, setShowAdoptDialog] = useState(false)
  const [newPetName, setNewPetName] = useState("")
  const [newPetType, setNewPetType] = useState("dog")

  useEffect(() => {
    loadPets()
    const interval = setInterval(loadPets, 60000)
    return () => clearInterval(interval)
  }, [username])

  const loadPets = async () => {
    if (!username) return

    try {
      const response = await fetch(`/api/pets?owner=${username}`)
      const data = await response.json()
      if (data.pets) {
        setPets(data.pets)
      }
    } catch (error) {
      console.error("Error loading pets:", error)
    }
  }

  const savePets = async (updatedPets: Pet[]) => {
    setPets(updatedPets)
  }

  const adoptPet = async () => {
    if (!username) {
      alert("Please sign in to adopt a pet")
      return
    }

    if (!newPetName.trim()) {
      alert("Please enter a name for your pet")
      return
    }

    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPetName.trim(),
          type: newPetType,
          owner: username,
        }),
      })

      const data = await response.json()

      if (data.pet) {
        await loadPets()
        setNewPetName("")
        setShowAdoptDialog(false)
      }
    } catch (error) {
      console.error("Error adopting pet:", error)
      alert("Failed to adopt pet")
    }
  }

  const feedPet = async (petId: string) => {
    if (!username) {
      alert("Please sign in to interact with pets")
      return
    }

    try {
      const response = await fetch("/api/pets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          owner: username,
          action: "feed",
        }),
      })

      const data = await response.json()

      if (data.pet) {
        await loadPets()
      }
    } catch (error) {
      console.error("Error feeding pet:", error)
    }
  }

  const playWithPet = async (petId: string) => {
    if (!username) {
      alert("Please sign in to interact with pets")
      return
    }

    try {
      const response = await fetch("/api/pets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          owner: username,
          action: "play",
        }),
      })

      const data = await response.json()

      if (data.pet) {
        await loadPets()
      } else if (data.error) {
        alert(data.error)
      }
    } catch (error) {
      console.error("Error playing with pet:", error)
    }
  }

  const petPet = async (petId: string) => {
    if (!username) {
      alert("Please sign in to interact with pets")
      return
    }

    try {
      const response = await fetch("/api/pets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          owner: username,
          action: "pet",
        }),
      })

      const data = await response.json()

      if (data.pet) {
        await loadPets()
      }
    } catch (error) {
      console.error("Error petting pet:", error)
    }
  }

  const getPetEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      dog: "🐕",
      cat: "🐈",
      rabbit: "🐰",
      hamster: "🐹",
      bird: "🐦",
      fish: "🐠",
    }
    return emojis[type] || "🐾"
  }

  const getStatusColor = (value: number) => {
    if (value >= 70) return "bg-green-500"
    if (value >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (!username) {
    return (
      <Card className="bg-white shadow-md">
        <CardContent className="py-12 text-center">
          <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to adopt and care for virtual pets</p>
        </CardContent>
      </Card>
    )
  }

  const userPets = pets.filter((pet) => pet.owner === username)

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <PawPrint className="h-6 w-6" />
              Virtual Pets
            </CardTitle>
            <Dialog open={showAdoptDialog} onOpenChange={setShowAdoptDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <PawPrint className="h-4 w-4 mr-2" />
                  Adopt Pet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adopt a New Pet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pet Name</label>
                    <Input
                      placeholder="Enter pet name..."
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pet Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["dog", "cat", "rabbit", "hamster", "bird", "fish"].map((type) => (
                        <Button
                          key={type}
                          variant={newPetType === type ? "default" : "outline"}
                          onClick={() => setNewPetType(type)}
                          className="h-16 text-2xl"
                        >
                          {getPetEmoji(type)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={adoptPet} className="w-full" disabled={!newPetName.trim()}>
                    Adopt {getPetEmoji(newPetType)}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {userPets.length === 0 ? (
        <Card className="bg-white shadow-md">
          <CardContent className="py-12 text-center">
            <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No pets yet</h3>
            <p className="text-muted-foreground mb-4">Adopt your first virtual pet!</p>
            <Button onClick={() => setShowAdoptDialog(true)}>
              <PawPrint className="h-4 w-4 mr-2" />
              Adopt Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userPets.map((pet) => (
            <Card key={pet.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{getPetEmoji(pet.type)}</div>
                  <h3 className="text-xl font-bold">{pet.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span>Level {pet.level}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Apple className="h-4 w-4" />
                        Hunger
                      </span>
                      <span>{Math.round(pet.hunger)}%</span>
                    </div>
                    <Progress value={pet.hunger} className={getStatusColor(pet.hunger)} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        Happiness
                      </span>
                      <span>{Math.round(pet.happiness)}%</span>
                    </div>
                    <Progress value={pet.happiness} className={getStatusColor(pet.happiness)} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        Energy
                      </span>
                      <span>{Math.round(pet.energy)}%</span>
                    </div>
                    <Progress value={pet.energy} className={getStatusColor(pet.energy)} />
                  </div>

                  <div className="bg-gray-100 rounded-lg p-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Experience</span>
                      <span>{pet.experience % 100}/100</span>
                    </div>
                    <Progress value={pet.experience % 100} className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => feedPet(pet.id)} disabled={pet.hunger >= 100}>
                    <Apple className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => playWithPet(pet.id)} disabled={pet.energy < 20}>
                    <Gamepad2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => petPet(pet.id)}>
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
