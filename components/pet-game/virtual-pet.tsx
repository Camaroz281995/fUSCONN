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
  { id: "cat", name: "Cat", emoji: "🐱" },
  { id: "dog", name: "Dog", emoji: "🐶" },
  { id: "rabbit", name: "Rabbit", emoji: "🐰" },
  { id: "hamster", name: "Hamster", emoji: "🐹" },
  { id: "dragon", name: "Dragon", emoji: "🐉" },
  { id: "fox", name: "Fox", emoji: "🦊" },
  { id: "unicorn", name: "Unicorn", emoji: "🦄" },
  { id: "penguin", name: "Penguin", emoji: "🐧" },
]

export default function VirtualPet() {
  const { username } = useUser()
  const [pet, setPet] = useState<VirtualPet | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [petName, setPetName] = useState("")
  const [petType, setPetType] = useState("cat")
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
    if (!username || !petName.trim() || !petType) return

    const selectedPetType = PET_TYPES.find((p) => p.id === petType) || PET_TYPES[0]

    const newPet: VirtualPet = {
      name: petName.trim(),
      type: petType,
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
      items: [],
    }

    setPet(newPet)
    persistentStorage.saveUserPet(newPet)
    setShowCreateDialog(false)
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
    if (health >= 80) return "Happy"
    if (health >= 60) return "Content"
    if (health >= 40) return "Okay"
    if (health >= 20) return "Sad"
    return "Miserable"
  }

  if (!username) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please set your username in the Profile tab to adopt a virtual pet</p>
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
                  <Select value={petType} onValueChange={setPetType}>
                    <SelectTrigger id="pet-type">
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <span className="flex items-center">
                            <span className="mr-2">{type.emoji}</span>
                            {type.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePet} disabled={!petName.trim() || !petType}>
                  Adopt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

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
          <span>{pet.name}</span>
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-1 text-yellow-500" />
            <span>Level {pet.level}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="text-8xl mb-2">{pet.emoji}</div>
          <div className="text-sm text-muted-foreground">Mood: {getPetMood()}</div>

          <div className="w-full mt-4 bg-muted rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${(pet.experience / (pet.level * 100)) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            XP: {pet.experience} / {pet.level * 100}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Utensils className="h-4 w-4 mr-1 text-orange-500" />
                <span className="text-sm">Hunger</span>
              </div>
              <span className="text-sm">{pet.hunger}%</span>
            </div>
            <Progress value={pet.hunger} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-sm">Happiness</span>
              </div>
              <span className="text-sm">{pet.happiness}%</span>
            </div>
            <Progress value={pet.happiness} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Gamepad2 className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-sm">Energy</span>
              </div>
              <span className="text-sm">{pet.energy}%</span>
            </div>
            <Progress value={pet.energy} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                <span className="text-sm">Hydration</span>
              </div>
              <span className="text-sm">{pet.hydration}%</span>
            </div>
            <Progress value={pet.hydration} className="h-2" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => handleInteraction("feed")} disabled={isOnCooldown("feed")}>
          {isOnCooldown("feed") ? `${getCooldownRemaining("feed")}s` : "Feed"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleInteraction("play")} disabled={isOnCooldown("play")}>
          {isOnCooldown("play") ? `${getCooldownRemaining("play")}s` : "Play"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleInteraction("rest")} disabled={isOnCooldown("rest")}>
          {isOnCooldown("rest") ? `${getCooldownRemaining("rest")}s` : "Rest"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleInteraction("water")} disabled={isOnCooldown("water")}>
          {isOnCooldown("water") ? `${getCooldownRemaining("water")}s` : "Water"}
        </Button>
      </CardFooter>
    </Card>
  )
}
