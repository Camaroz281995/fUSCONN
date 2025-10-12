"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Utensils, Gamepad2, Droplets, Award, Plus, Sparkles } from "lucide-react"
import { persistentStorage } from "@/lib/persistent-storage"
import type { VirtualPet } from "@/lib/types"

const PET_TYPES = [
  {
    id: "cat",
    name: "Cat",
    emoji: "🐱",
    breeds: ["Persian", "Siamese", "Maine Coon", "British Shorthair", "Ragdoll"],
    traits: ["Independent", "Curious", "Playful", "Affectionate"],
  },
  {
    id: "dog",
    name: "Dog",
    emoji: "🐕",
    breeds: ["Golden Retriever", "German Shepherd", "Labrador", "Bulldog", "Poodle"],
    traits: ["Loyal", "Energetic", "Friendly", "Protective"],
  },
  {
    id: "rabbit",
    name: "Rabbit",
    emoji: "🐰",
    breeds: ["Holland Lop", "Netherland Dwarf", "Flemish Giant", "Angora"],
    traits: ["Gentle", "Quiet", "Social", "Active"],
  },
  {
    id: "hamster",
    name: "Hamster",
    emoji: "🐹",
    breeds: ["Syrian", "Dwarf Campbell", "Roborovski", "Chinese"],
    traits: ["Small", "Active", "Nocturnal", "Cute"],
  },
  {
    id: "bird",
    name: "Bird",
    emoji: "🐦",
    breeds: ["Parakeet", "Canary", "Cockatiel", "Lovebird"],
    traits: ["Musical", "Colorful", "Social", "Intelligent"],
  },
  {
    id: "fish",
    name: "Fish",
    emoji: "🐠",
    breeds: ["Goldfish", "Betta", "Guppy", "Angelfish"],
    traits: ["Peaceful", "Colorful", "Graceful", "Calming"],
  },
]

export default function VirtualPetComponent() {
  const { username } = useUser()
  const [pet, setPet] = useState<VirtualPet | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [petName, setPetName] = useState("")
  const [petType, setPetType] = useState("cat")
  const [selectedBreed, setSelectedBreed] = useState("")
  const [lastInteraction, setLastInteraction] = useState<Record<string, number>>({})
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false)

  // Load pet data
  useEffect(() => {
    if (!username) return

    const userPet = persistentStorage.getUserPet(username)
    if (userPet) {
      setPet(userPet)

      // Calculate stat decay since last visit
      const now = Date.now()
      const timeSinceLastVisit = now - userPet.lastVisit
      const hoursElapsed = timeSinceLastVisit / (1000 * 60 * 60)

      // Decay stats (lose up to 20 points per day)
      if (hoursElapsed > 0) {
        const decayPerHour = 20 / 24
        const decayAmount = Math.min(Math.floor(hoursElapsed * decayPerHour), 50)

        const updatedPet = {
          ...userPet,
          hunger: Math.max(userPet.hunger - decayAmount, 10),
          happiness: Math.max(userPet.happiness - decayAmount, 10),
          energy: Math.max(userPet.energy - decayAmount, 10),
          hydration: Math.max(userPet.hydration - decayAmount, 10),
          lastVisit: now,
        }

        setPet(updatedPet)
        persistentStorage.saveUserPet(updatedPet)
      }
    }
  }, [username])

  // Create a new pet
  const handleCreatePet = () => {
    if (!username || !petName.trim() || !petType || !selectedBreed) return

    const selectedPetType = PET_TYPES.find((p) => p.id === petType) || PET_TYPES[0]

    const newPet: VirtualPet = {
      name: petName.trim(),
      type: petType as VirtualPet["type"],
      emoji: selectedPetType.emoji,
      owner: username,
      hunger: 80,
      happiness: 80,
      energy: 80,
      hydration: 80,
      level: 1,
      experience: 0,
      createdAt: Date.now(),
      lastVisit: Date.now(),
      items: [selectedBreed],
    }

    setPet(newPet)
    persistentStorage.saveUserPet(newPet)
    setShowCreateDialog(false)
    setPetName("")
    setSelectedBreed("")
  }

  // Interaction cooldowns (in milliseconds)
  const COOLDOWNS = {
    feed: 2 * 60 * 1000, // 2 minutes
    play: 3 * 60 * 1000, // 3 minutes
    rest: 5 * 60 * 1000, // 5 minutes
    water: 2 * 60 * 1000, // 2 minutes
  }

  // Check if interaction is on cooldown
  const isOnCooldown = (action: string) => {
    const lastTime = lastInteraction[action] || 0
    return Date.now() - lastTime < COOLDOWNS[action as keyof typeof COOLDOWNS]
  }

  // Get remaining cooldown time in seconds
  const getCooldownRemaining = (action: string) => {
    const lastTime = lastInteraction[action] || 0
    const cooldown = COOLDOWNS[action as keyof typeof COOLDOWNS]
    const remaining = Math.max(0, cooldown - (Date.now() - lastTime))
    return Math.ceil(remaining / 1000)
  }

  // Handle pet interactions
  const handleInteraction = (action: "feed" | "play" | "rest" | "water") => {
    if (!pet || isOnCooldown(action)) return

    // Update last interaction time
    setLastInteraction((prev) => ({
      ...prev,
      [action]: Date.now(),
    }))

    // Clone pet object
    const updatedPet = { ...pet }

    // Apply interaction effects
    switch (action) {
      case "feed":
        updatedPet.hunger = Math.min(100, updatedPet.hunger + 15)
        updatedPet.experience += 5
        break
      case "play":
        updatedPet.happiness = Math.min(100, updatedPet.happiness + 20)
        updatedPet.energy = Math.max(10, updatedPet.energy - 10)
        updatedPet.experience += 10
        break
      case "rest":
        updatedPet.energy = Math.min(100, updatedPet.energy + 30)
        updatedPet.experience += 5
        break
      case "water":
        updatedPet.hydration = Math.min(100, updatedPet.hydration + 15)
        updatedPet.experience += 5
        break
    }

    // Check for level up
    const expNeeded = updatedPet.level * 100
    if (updatedPet.experience >= expNeeded) {
      updatedPet.level += 1
      updatedPet.experience -= expNeeded
      setShowLevelUpAnimation(true)
      setTimeout(() => setShowLevelUpAnimation(false), 3000)
    }

    // Update last visit time
    updatedPet.lastVisit = Date.now()

    // Save updated pet
    setPet(updatedPet)
    persistentStorage.saveUserPet(updatedPet)
  }

  // Calculate overall pet health (average of all stats)
  const calculateHealth = () => {
    if (!pet) return 0
    return Math.floor((pet.hunger + pet.happiness + pet.energy + pet.hydration) / 4)
  }

  // Get pet mood based on health
  const getPetMood = () => {
    const health = calculateHealth()
    if (health >= 80) return "😊 Happy"
    if (health >= 60) return "😌 Content"
    if (health >= 40) return "😐 Okay"
    if (health >= 20) return "😔 Sad"
    return "😢 Miserable"
  }

  const selectedPetType = PET_TYPES.find((p) => p.id === petType)

  if (!username) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to adopt a virtual pet</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-medium mb-2">Adopt a Virtual Pet</h3>
          <p className="text-muted-foreground mb-6">Care for your own virtual companion</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Adopt a Pet
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adopt a Pet</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="pet-name">Pet Name</Label>
                  <Input
                    id="pet-name"
                    placeholder="Enter a name for your pet"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pet-type">Pet Type</Label>
                  <Select
                    value={petType}
                    onValueChange={(value) => {
                      setPetType(value)
                      setSelectedBreed("")
                    }}
                  >
                    <SelectTrigger id="pet-type">
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <span className="flex items-center">
                            <span className="text-lg mr-2">{type.emoji}</span>
                            {type.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPetType && (
                  <>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-8xl">{selectedPetType.emoji}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pet-breed">Breed</Label>
                      <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                        <SelectTrigger id="pet-breed">
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedPetType.breeds.map((breed) => (
                            <SelectItem key={breed} value={breed}>
                              {breed}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Pet Traits</h4>
                      <p className="text-sm text-muted-foreground">{selectedPetType.traits.join(", ")}</p>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePet} disabled={!petName.trim() || !petType || !selectedBreed}>
                  Adopt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  const petTypeInfo = PET_TYPES.find((p) => p.id === pet.type)
  const breed = pet.items[0] || "Mixed"

  return (
    <Card className="relative overflow-hidden">
      {showLevelUpAnimation && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 animate-pulse">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-white">Level Up!</h2>
            <p className="text-xl text-white">
              {pet.name} is now level {pet.level}
            </p>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{pet.emoji}</span>
              <span>{pet.name}</span>
              <span className="text-sm text-muted-foreground">({breed})</span>
            </div>
            <p className="text-sm text-muted-foreground font-normal">{petTypeInfo?.traits.slice(0, 2).join(", ")}</p>
          </div>
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-1 text-yellow-500" />
            <span>Level {pet.level}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
            <span className="text-9xl animate-bounce" style={{ animationDuration: "2s" }}>
              {pet.emoji}
            </span>
          </div>
          <div className="text-lg font-medium mb-2">{getPetMood()}</div>

          <div className="w-full mt-4 bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(pet.experience / (pet.level * 100)) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            XP: {pet.experience} / {pet.level * 100}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Utensils className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-sm font-medium">Hunger</span>
              </div>
              <span className="text-sm font-bold">{pet.hunger}%</span>
            </div>
            <Progress value={pet.hunger} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm font-medium">Happiness</span>
              </div>
              <span className="text-sm font-bold">{pet.happiness}%</span>
            </div>
            <Progress value={pet.happiness} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Gamepad2 className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">Energy</span>
              </div>
              <span className="text-sm font-bold">{pet.energy}%</span>
            </div>
            <Progress value={pet.energy} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium">Hydration</span>
              </div>
              <span className="text-sm font-bold">{pet.hydration}%</span>
            </div>
            <Progress value={pet.hydration} className="h-3" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleInteraction("feed")}
          disabled={isOnCooldown("feed")}
          className="flex-1"
        >
          🍎 {isOnCooldown("feed") ? `${getCooldownRemaining("feed")}s` : "Feed"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleInteraction("play")}
          disabled={isOnCooldown("play")}
          className="flex-1"
        >
          🎾 {isOnCooldown("play") ? `${getCooldownRemaining("play")}s` : "Play"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleInteraction("rest")}
          disabled={isOnCooldown("rest")}
          className="flex-1"
        >
          😴 {isOnCooldown("rest") ? `${getCooldownRemaining("rest")}s` : "Rest"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleInteraction("water")}
          disabled={isOnCooldown("water")}
          className="flex-1"
        >
          💧 {isOnCooldown("water") ? `${getCooldownRemaining("water")}s` : "Water"}
        </Button>
      </CardFooter>
    </Card>
  )
}
