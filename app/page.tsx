"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProvider } from "@/context/user-context"
import ProfileTab from "@/components/tabs/profile-tab"
import PostTab from "@/components/tabs/post-tab"
import SmartFeed from "@/components/smart-feed/smart-feed"
import MarketplaceTab from "@/components/tabs/marketplace-tab"
import MessagingTab from "@/components/tabs/messaging-tab"
import StoriesBar from "@/components/stories/stories-bar"
import FriendLists from "@/components/friends/friend-lists"
import VirtualPet from "@/components/pet-game/virtual-pet"
import MusicTab from "@/components/tabs/music-tab"
import LiveStreamingTab from "@/components/tabs/live-streaming-tab"
import CallingTab from "@/components/tabs/calling-tab"
import { ThemeProvider } from "@/components/theme-provider"
import { Home, ShoppingBag, Users, Music, Radio, Gamepad, User, Phone, MessageSquare } from 'lucide-react'

function AppContent() {
  const [activeTab, setActiveTab] = useState("feed")
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [backgroundBlur, setBackgroundBlur] = useState(0)
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.1)
  const [backgroundBrightness, setBackgroundBrightness] = useState(100)
  const [backgroundParallax, setBackgroundParallax] = useState(false)
  const [backgroundFilter, setBackgroundFilter] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Load background settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedImage = localStorage.getItem("backgroundImage")
      const storedBlur = localStorage.getItem("backgroundBlur")
      const storedOpacity = localStorage.getItem("backgroundOpacity")
      const storedBrightness = localStorage.getItem("backgroundBrightness")
      const storedParallax = localStorage.getItem("backgroundParallax")
      const storedFilter = localStorage.getItem("backgroundFilter")
      const storedColor = localStorage.getItem("backgroundColor")

      if (storedImage) setBackgroundImage(storedImage)
      if (storedBlur) setBackgroundBlur(Number(storedBlur))
      if (storedOpacity) setBackgroundOpacity(Number(storedOpacity))
      if (storedBrightness) setBackgroundBrightness(Number(storedBrightness))
      if (storedParallax) setBackgroundParallax(storedParallax === "true")
      if (storedFilter) setBackgroundFilter(storedFilter)
      if (storedColor) setBackgroundColor(storedColor)
    }
  }, [])

  // Handle mouse move for parallax effect
  useEffect(() => {
    if (!backgroundParallax) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [backgroundParallax])

  // Calculate parallax transform
  const getParallaxStyle = () => {
    if (!backgroundParallax) return {}

    const offsetX = (mousePosition.x - 0.5) * 20
    const offsetY = (mousePosition.y - 0.5) * 20

    return {
      transform: `translate(${offsetX}px, ${offsetY}px)`,
      transition: "transform 0.1s ease-out",
    }
  }

  // Get background filter style
  const getFilterStyle = () => {
    let filterStyle = `brightness(${backgroundBrightness}%)`

    if (backgroundFilter) {
      switch (backgroundFilter) {
        case "grayscale":
          filterStyle += " grayscale(1)"
          break
        case "sepia":
          filterStyle += " sepia(0.7)"
          break
        case "invert":
          filterStyle += " invert(0.8)"
          break
        case "hue-rotate":
          filterStyle += " hue-rotate(90deg)"
          break
      }
    }

    return filterStyle
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      {(backgroundImage || backgroundColor) && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundColor: backgroundColor || undefined,
            ...getParallaxStyle(),
          }}
        >
          {backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                filter: getFilterStyle(),
                opacity: backgroundOpacity,
                backdropFilter: `blur(${backgroundBlur}px)`,
              }}
            />
          )}
        </div>
      )}

      {/* Content */}
      <main className="flex-1 container mx-auto p-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/images/fusconn-logo.png" 
                alt="fUSCONN Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  console.error("Logo load error:", e)
                  e.currentTarget.style.display = 'none'
                }}
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">fUSCONN</h1>
              <img 
                src="/images/fusconn-logo.png" 
                alt="fUSCONN Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  console.error("Logo load error:", e)
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <p className="text-muted-foreground">Connect. Share. Thrive.</p>
          </div>

          {/* Stories Bar */}
          <StoriesBar />

          {/* Main Tabs */}
          <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-9 mb-4">
              <TabsTrigger value="feed">
                <Home className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="calling">
                <Phone className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Calls</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                <ShoppingBag className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Market</span>
              </TabsTrigger>
              <TabsTrigger value="friends">
                <Users className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Friends</span>
              </TabsTrigger>
              <TabsTrigger value="music">
                <Music className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Music</span>
              </TabsTrigger>
              <TabsTrigger value="live">
                <Radio className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Live</span>
              </TabsTrigger>
              <TabsTrigger value="pet">
                <Gamepad className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Pet</span>
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 gap-4">
              <TabsContent value="feed" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-4">
                    <PostTab />
                    <SmartFeed />
                  </div>
                  <div className="hidden md:block">
                    <ProfileTab
                      onBackgroundImageChange={setBackgroundImage}
                      onBackgroundBlurChange={setBackgroundBlur}
                      onBackgroundOpacityChange={setBackgroundOpacity}
                      onBackgroundBrightnessChange={setBackgroundBrightness}
                      onBackgroundParallaxChange={setBackgroundParallax}
                      onBackgroundFilterChange={setBackgroundFilter}
                      onBackgroundColorChange={setBackgroundColor}
                      backgroundImage={backgroundImage}
                      backgroundBlur={backgroundBlur}
                      backgroundOpacity={backgroundOpacity}
                      backgroundBrightness={backgroundBrightness}
                      backgroundParallax={backgroundParallax}
                      backgroundFilter={backgroundFilter}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="messages" className="mt-0">
                <MessagingTab />
              </TabsContent>

              <TabsContent value="calling" className="mt-0">
                <CallingTab />
              </TabsContent>

              <TabsContent value="marketplace" className="mt-0">
                <MarketplaceTab />
              </TabsContent>

              <TabsContent value="friends" className="mt-0">
                <FriendLists />
              </TabsContent>

              <TabsContent value="music" className="mt-0">
                <MusicTab />
              </TabsContent>

              <TabsContent value="live" className="mt-0">
                <LiveStreamingTab />
              </TabsContent>

              <TabsContent value="pet" className="mt-0">
                <VirtualPet />
              </TabsContent>

              <TabsContent value="profile" className="mt-0">
                <div className="max-w-2xl mx-auto">
                  <ProfileTab
                    onBackgroundImageChange={setBackgroundImage}
                    onBackgroundBlurChange={setBackgroundBlur}
                    onBackgroundOpacityChange={setBackgroundOpacity}
                    onBackgroundBrightnessChange={setBackgroundBrightness}
                    onBackgroundParallaxChange={setBackgroundParallax}
                    onBackgroundFilterChange={setBackgroundFilter}
                    onBackgroundColorChange={setBackgroundColor}
                    backgroundImage={backgroundImage}
                    backgroundBlur={backgroundBlur}
                    backgroundOpacity={backgroundOpacity}
                    backgroundBrightness={backgroundBrightness}
                    backgroundParallax={backgroundParallax}
                    backgroundFilter={backgroundFilter}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function FusionaryConnectraApp() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  )
}
