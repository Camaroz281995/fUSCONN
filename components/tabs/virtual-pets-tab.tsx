"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Heart, Gamepad2, Utensils, Plus, Sparkles } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import { generateId } from "@/lib/utils"

interface VirtualPet {
  id: string
  name: string
  type: "dog" | "cat" | "hamster"
  emoji: string
  owner: string
  happiness: number
  hunger: number
  energy: number
  level: number
  experience: number
  lastInteraction: number
  createdAt: number
}

const PET_TYPES = [
  { type: "dog" as const, emoji: "🐕", name: "Dog" },
  { type: "cat" as const, emoji: "🐱", name: "Cat" },
  { type: "hamster" as const, emoji: "🐹", name: "Hamster" },
]

export default function VirtualPetsTab() {
  const { username } = useUser()
  const [pets, setPets] = useState<VirtualPet[]>([])
  const [selectedPet, setSelectedPet] = useState<VirtualPet | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPetType, setNewPetType] = useState<"dog" | "cat" | "hamster">("dog")
  const [lastActionTime, setLastActionTime] = useState<Record<string, number>>({})

  useEffect(() => {
    loadPets()
    const interval = setInterval(updatePetStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadPets = () => {
    if (!username) return
    const userPets = persistentStorage.getUserPets(username)
    setPets(userPets)
    if (userPets.length > 0 && !selectedPet) {
      setSelectedPet(userPets[0])
    }
  }

  const updatePetStats = () => {
    if (!username) return
    const userPets = persistentStorage.getUserPets(username)
    const now = Date.now()

    const updatedPets = userPets.map((pet) => {
      const timeSinceLastInteraction = now - pet.lastInteraction
      const hoursElapsed = timeSinceLastInteraction / (1000 * 60 * 60)

      // Decrease stats over time
      const hungerDecrease = Math.floor(hoursElapsed * 5)
      const happinessDecrease = Math.floor(hoursElapsed * 3)
      const energyDecrease = Math.floor(hoursElapsed * 2)

      return {
        ...pet,
        hunger: Math.max(0, pet.hunger - hungerDecrease),
        happiness: Math.max(0, pet.happiness - happinessDecrease),
        energy: Math.max(0, pet.energy - energyDecrease),
      }
    })

    persistentStorage.saveUserPets(username, updatedPets)
    setPets(updatedPets)

    if (selectedPet) {
      const updatedSelectedPet = updatedPets.find((p) => p.id === selectedPet.id)
      if (updatedSelectedPet) {
        setSelectedPet(updatedSelectedPet)
      }
    }
  }

  const createPet = () => {
    if (!username) return

    const petType = PET_TYPES.find((p) => p.type === newPetType)!
    const newPet: VirtualPet = {
      id: generateId(),
      name: `My ${petType.name}`,
      type: newPetType,
      emoji: petType.emoji,
      owner: username,
      happiness: 80,
      hunger: 70,
      energy: 90,
      level: 1,
      experience: 0,
      lastInteraction: Date.now(),
      createdAt: Date.now(),
    }

    const userPets = [...pets, newPet]
    persistentStorage.saveUserPets(username, userPets)
    setPets(userPets)
    setSelectedPet(newPet)
    setShowCreateDialog(false)
  }

  const performAction = (action: "feed" | "play" | "pet") => {
    if (!selectedPet || !username) return

    const now = Date.now()
    const actionKey = `${selectedPet.id}-${action}`
    const lastAction = lastActionTime[actionKey] || 0
    const cooldown = 60000 // 1 minute cooldown

    if (now - lastAction < cooldown) {
      return // Still on cooldown
    }

    setLastActionTime((prev) => ({ ...prev, [actionKey]: now }))

    const updatedPet = { ...selectedPet, lastInteraction: now }
    let expGain = 0

    switch (action) {
      case "feed":
        updatedPet.hunger = Math.min(100, updatedPet.hunger + 20)
        updatedPet.happiness = Math.min(100, updatedPet.happiness + 5)
        expGain = 10
        break
      case "play":
        updatedPet.happiness = Math.min(100, updatedPet.happiness + 25)
        updatedPet.energy = Math.max(0, updatedPet.energy - 15)
        expGain = 15
        break
      case "pet":
        updatedPet.happiness = Math.min(100, updatedPet.happiness + 15)
        updatedPet.energy = Math.min(100, updatedPet.energy + 10)
        expGain = 8
        break
    }

    updatedPet.experience += expGain

    // Level up check
    const expNeeded = updatedPet.level * 100
    if (updatedPet.experience >= expNeeded) {
      updatedPet.level += 1
      updatedPet.experience -= expNeeded
    }

    const updatedPets = pets.map((p) => (p.id === updatedPet.id ? updatedPet : p))
    persistentStorage.saveUserPets(username, updatedPets)
    setPets(updatedPets)
    setSelectedPet(updatedPet)
  }

  const getCooldownRemaining = (action: "feed" | "play" | "pet") => {
    if (!selectedPet) return 0
    const actionKey = `${selectedPet.id}-${action}`
    const lastAction = lastActionTime[actionKey] || 0
    const cooldown = 60000
    const remaining = Math.max(0, cooldown - (Date.now() - lastAction))
    return Math.ceil(remaining / 1000)
  }

  const getPetMood = () => {
    if (!selectedPet) return "😐"
    const avgStat = (selectedPet.happiness + selectedPet.hunger + selectedPet.energy) / 3
    if (avgStat >= 80) return "😊"
    if (avgStat >= 60) return "🙂"
    if (avgStat >= 40) return "😐"
    if (avgStat >= 20) return "😔"
    return "😢"
  }

  if (!username) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sign in to adopt virtual pets</h3>
          <p className="text-muted-foreground">Care for your digital companions</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Virtual Pets
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adopt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Adopt a Pet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">Choose your new companion:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {PET_TYPES.map((pet) => (
                        <button
                          key={pet.type}
                          onClick={() => setNewPetType(pet.type)}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            newPetType === pet.type
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-4xl mb-2">{pet.emoji}</div>
                          <div className="text-sm font-medium">{pet.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={createPet} className="w-full">
                    Adopt {PET_TYPES.find((p) => p.type === newPetType)?.name}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-medium mb-2">No pets yet</h3>
            <p className="text-muted-foreground mb-4">Adopt your first virtual pet to get started!</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adopt a Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pet Selection */}
          {pets.length > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className={`flex-shrink-0 p-3 rounded-lg border-2 transition-colors ${
                        selectedPet?.id === pet.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{pet.emoji}</div>
                      <div className="text-xs font-medium">{pet.name}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Lv.{pet.level}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Pet */}
          {selectedPet && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4 animate-bounce" style={{ animationDuration: "2s" }}>
                    {selectedPet.emoji}
                  </div>
                  <h2 className="text-xl font-bold mb-2">{selectedPet.name}</h2>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">Level {selectedPet.level}</Badge>
                    <span>{getPetMood()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Happiness
                      </span>
                      <span className="text-sm font-bold">{selectedPet.happiness}%</span>
                    </div>
                    <Progress value={selectedPet.happiness} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-orange-500" />
                        Hunger
                      </span>
                      <span className="text-sm font-bold">{selectedPet.hunger}%</span>
                    </div>
                    <Progress value={selectedPet.hunger} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-green-500" />
                        Energy
                      </span>
                      <span className="text-sm font-bold">{selectedPet.energy}%</span>
                    </div>
                    <Progress value={selectedPet.energy} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        Experience
                      </span>
                      <span className="text-sm font-bold">
                        {selectedPet.experience}/{selectedPet.level * 100}
                      </span>
                    </div>
                    <Progress value={(selectedPet.experience / (selectedPet.level * 100)) * 100} className="h-2" />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => performAction("feed")}
                    disabled={getCooldownRemaining("feed") > 0}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Utensils className="h-5 w-5" />
                    <span className="text-xs">
                      {getCooldownRemaining("feed") > 0 ? `${getCooldownRemaining("feed")}s` : "Feed"}
                    </span>
                  </Button>

                  <Button
                    onClick={() => performAction("play")}
                    disabled={getCooldownRemaining("play") > 0}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Gamepad2 className="h-5 w-5" />
                    <span className="text-xs">
                      {getCooldownRemaining("play") > 0 ? `${getCooldownRemaining("play")}s` : "Play"}
                    </span>
                  </Button>

                  <Button
                    onClick={() => performAction("pet")}
                    disabled={getCooldownRemaining("pet") > 0}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-xs">
                      {getCooldownRemaining("pet") > 0 ? `${getCooldownRemaining("pet")}s` : "Pet"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
