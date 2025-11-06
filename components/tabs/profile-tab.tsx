"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface ProfileTabProps {
  username: string
}

const profilePhotoCache = new Map<string, string>()
const backgroundPhotoCache = new Map<string, string>()

export default function ProfileTab({ username }: ProfileTabProps) {
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [profilePhotoId, setProfilePhotoId] = useState("")
  const [backgroundPhotoId, setBackgroundPhotoId] = useState("")
  const [backgroundBlur, setBackgroundBlur] = useState(0)
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)
  const [backgroundBrightness, setBackgroundBrightness] = useState(100)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingBackground, setUploadingBackground] = useState(false)
  const [profileProgress, setProfileProgress] = useState(0)
  const [backgroundProgress, setBackgroundProgress] = useState(0)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (username) {
      loadProfile()
    }
  }, [username])

  const loadProfile = () => {
    const profileKey = `profile_${username}`
    const stored = localStorage.getItem(profileKey)
    if (stored) {
      try {
        const profile = JSON.parse(stored)
        setBio(profile.bio || "")
        setLocation(profile.location || "")
        setWebsite(profile.website || "")
        setProfilePhotoId(profile.profilePhotoId || "")
        setBackgroundPhotoId(profile.backgroundPhotoId || "")
        setBackgroundBlur(profile.backgroundBlur || 0)
        setBackgroundOpacity(profile.backgroundOpacity || 100)
        setBackgroundBrightness(profile.backgroundBrightness || 100)
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
  }

  const saveProfile = () => {
    if (!username) return

    const profileKey = `profile_${username}`
    const profile = {
      username,
      bio,
      location,
      website,
      profilePhotoId, // Store ID instead of data
      backgroundPhotoId, // Store ID instead of data
      backgroundBlur,
      backgroundOpacity,
      backgroundBrightness,
    }
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile))
      alert("Profile saved successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Unable to save profile. Storage limit reached.")
    }
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert("File is too large (max 5MB)")
      return
    }

    setUploadingProfile(true)
    setProfileProgress(0)

    const objectUrl = URL.createObjectURL(file)
    const photoId = `profile_${username}_${Date.now()}`
    profilePhotoCache.set(photoId, objectUrl)
    setProfilePhotoId(photoId)
    setProfileProgress(100)
    setTimeout(() => {
      setUploadingProfile(false)
      setProfileProgress(0)
    }, 500)
  }

  const handleBackgroundPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert("File is too large (max 5MB)")
      return
    }

    setUploadingBackground(true)
    setBackgroundProgress(0)

    const objectUrl = URL.createObjectURL(file)
    const photoId = `background_${username}_${Date.now()}`
    backgroundPhotoCache.set(photoId, objectUrl)
    setBackgroundPhotoId(photoId)
    setBackgroundProgress(100)
    setTimeout(() => {
      setUploadingBackground(false)
      setBackgroundProgress(0)
    }, 500)
  }

  const getProfilePhoto = () => profilePhotoCache.get(profilePhotoId)
  const getBackgroundPhoto = () => backgroundPhotoCache.get(backgroundPhotoId)

  if (!username) {
    return (
      <Card className="bg-white shadow-md">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to view and edit your profile</p>
        </CardContent>
      </Card>
    )
  }

  const profilePhoto = getProfilePhoto()
  const backgroundPhoto = getBackgroundPhoto()

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-md">
        <div
          className="h-32 relative overflow-hidden"
          style={{
            backgroundImage: backgroundPhoto ? `url(${backgroundPhoto})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: backgroundPhoto ? "transparent" : "#3b82f6",
            filter: `blur(${backgroundBlur}px) brightness(${backgroundBrightness}%)`,
            opacity: backgroundOpacity / 100,
          }}
        >
          {!backgroundPhoto && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => backgroundInputRef.current?.click()}
              disabled={uploadingBackground}
            >
              <Camera className="h-4 w-4 mr-1" />
              {uploadingBackground ? "Uploading..." : "Change Cover"}
            </Button>
          </div>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundPhotoChange}
            className="hidden"
          />
        </div>

        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-4 -mt-16">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg cursor-pointer">
                {profilePhoto ? (
                  <AvatarImage src={profilePhoto || "/placeholder.svg"} alt={username} />
                ) : (
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                onClick={() => profileInputRef.current?.click()}
                disabled={uploadingProfile}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 mt-4 md:mt-16">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">@{username}</h2>
                  {bio && <p className="text-muted-foreground mt-1">{bio}</p>}
                  <div className="flex gap-4 mt-2 text-sm">
                    {location && <span className="text-muted-foreground">📍 {location}</span>}
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        🔗 {website}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(uploadingProfile || uploadingBackground) && (
            <div className="mt-4 space-y-2">
              {uploadingProfile && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Uploading profile photo...</p>
                  <Progress value={profileProgress} className="h-2" />
                </div>
              )}
              {uploadingBackground && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Uploading background photo...</p>
                  <Progress value={backgroundProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where are you from?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://yourwebsite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Background Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {backgroundPhoto && (
            <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
              <img
                src={backgroundPhoto || "/placeholder.svg"}
                alt="Background preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="blur">Blur: {backgroundBlur}px</Label>
              <input
                id="blur"
                type="range"
                min="0"
                max="20"
                value={backgroundBlur}
                onChange={(e) => setBackgroundBlur(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="opacity">Opacity: {backgroundOpacity}%</Label>
              <input
                id="opacity"
                type="range"
                min="0"
                max="100"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="brightness">Brightness: {backgroundBrightness}%</Label>
              <input
                id="brightness"
                type="range"
                min="50"
                max="150"
                value={backgroundBrightness}
                onChange={(e) => setBackgroundBrightness(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveProfile} className="w-full" size="lg">
        <Save className="h-4 w-4 mr-2" />
        Save All Changes
      </Button>
    </div>
  )
}
