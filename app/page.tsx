"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Users, Home, User, Phone, ShoppingBag, Video, Radio, Dog, LogIn, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import PostsTab from "@/components/tabs/posts-tab"
import ChatsTab from "@/components/tabs/chats-tab"
import ProfileTab from "@/components/tabs/profile-tab"
import CallingTab from "@/components/tabs/calling-tab"
import CommunitiesTab from "@/components/tabs/communities-tab"
import MarketplaceTab from "@/components/tabs/marketplace-tab"
import VideosTab from "@/components/tabs/videos-tab"
import LiveStreamingTab from "@/components/tabs/live-streaming-tab"
import VirtualPetsTab from "@/components/tabs/virtual-pets-tab"

export default function FusionConnect() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [backgroundPhoto, setBackgroundPhoto] = useState("")
  const [backgroundBlur, setBackgroundBlur] = useState(0)
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)
  const [backgroundBrightness, setBackgroundBrightness] = useState(100)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [tempUsername, setTempUsername] = useState("")
  const [tempPassword, setTempPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const savedUsername = localStorage.getItem("username")
    console.log("Loading username from localStorage:", savedUsername)

    if (savedUsername) {
      setUsername(savedUsername)
      loadBackgroundSettings(savedUsername)
    }

    setIsLoading(false)

    const handleStorageChange = () => {
      const currentUsername = localStorage.getItem("username")
      if (currentUsername) {
        loadBackgroundSettings(currentUsername)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    const interval = setInterval(() => {
      const currentUsername = localStorage.getItem("username")
      if (currentUsername) {
        loadBackgroundSettings(currentUsername)
      }
    }, 1000)

    const initAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Autoplay blocked, will play on first interaction:", err)
        })
        document.removeEventListener("click", initAudio)
      }
    }
    document.addEventListener("click", initAudio)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
      document.removeEventListener("click", initAudio)
    }
  }, [])

  const loadBackgroundSettings = (user: string) => {
    const profileKey = `profile_${user}`
    const profileData = localStorage.getItem(profileKey)
    if (profileData) {
      try {
        const profile = JSON.parse(profileData)
        if (profile.backgroundPhoto) {
          setBackgroundPhoto(profile.backgroundPhoto)
          setBackgroundBlur(profile.backgroundBlur || 0)
          setBackgroundOpacity(profile.backgroundOpacity || 100)
          setBackgroundBrightness(profile.backgroundBrightness || 100)
        }
      } catch (error) {
        console.error("Error loading background:", error)
      }
    }
  }

  const handleAuth = async () => {
    setLoginError("")

    if (!tempUsername || !tempPassword) {
      setLoginError("Please enter both username and password")
      return
    }

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tempUsername, password: tempPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("username", tempUsername)
        console.log("Username saved to localStorage:", tempUsername)
        setUsername(tempUsername)
        setTempUsername("")
        setTempPassword("")
        setShowLoginDialog(false)
        loadBackgroundSettings(tempUsername)
      } else {
        setLoginError(data.error || "Authentication failed")
      }
    } catch (error) {
      console.error("Auth error:", error)
      setLoginError("An error occurred. Please try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("username")
    setUsername("")
    setPassword("")
    setBackgroundPhoto("")
    setBackgroundBlur(0)
    setBackgroundOpacity(100)
    setBackgroundBrightness(100)
    console.log("User logged out")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="text-center text-white">
          <div className="text-2xl font-bold mb-2">Loading fUSCONN...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        backgroundColor: backgroundPhoto ? "transparent" : "white",
        backgroundImage: backgroundPhoto ? `url(${backgroundPhoto})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <audio
        ref={audioRef}
        src="/relaxing-piano-music.mp3"
        loop
        autoPlay
        style={{ display: "none" }}
      />

      {backgroundPhoto && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backdropFilter: `blur(${backgroundBlur}px)`,
            backgroundColor: `rgba(255, 255, 255, ${1 - backgroundOpacity / 100})`,
            filter: `brightness(${backgroundBrightness}%)`,
          }}
        />
      )}

      <div className="relative z-10 flex flex-col h-screen">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/fusconn-logo.png" alt="fUSCONN" width={32} height={32} className="rounded-lg" />
              <h1 className="text-xl font-bold">fUSCONN</h1>
            </div>
            <div className="flex items-center gap-3">
              {username ? (
                <>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <LogIn className="h-4 w-4 mr-1" />
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <div className="flex items-center justify-center mb-4">
                        <Image src="/fusconn-logo.png" alt="fUSCONN" width={80} height={80} className="rounded-2xl" />
                      </div>
                      <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {isRegistering ? "Create Account" : "Sign In"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter username"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAuth()}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password"
                          value={tempPassword}
                          onChange={(e) => setTempPassword(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAuth()}
                        />
                      </div>

                      {loginError && <div className="text-red-500 text-sm text-center">{loginError}</div>}

                      <Button
                        onClick={handleAuth}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isRegistering ? "Register" : "Login"}
                      </Button>

                      <div className="text-center">
                        <button
                          onClick={() => {
                            setIsRegistering(!isRegistering)
                            setLoginError("")
                          }}
                          className="text-sm text-purple-600 hover:underline"
                        >
                          {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="home" className="h-full flex flex-col">
            <div className="bg-gray-200 border-b border-gray-300 py-2">
              <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-9 gap-1 h-12 bg-gray-100 p-1 rounded-lg shadow-sm">
                <TabsTrigger
                  value="home"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-[9px]">Home</span>
                </TabsTrigger>
                <TabsTrigger
                  value="chats"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-[9px]">Chats</span>
                </TabsTrigger>
                <TabsTrigger
                  value="communities"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-[9px]">Communities</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <User className="h-5 w-5" />
                  <span className="text-[9px]">Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calling"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <Phone className="h-5 w-5" />
                  <span className="text-[9px]">Calls</span>
                </TabsTrigger>
                <TabsTrigger
                  value="marketplace"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-[9px]">Shop</span>
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <Video className="h-5 w-5" />
                  <span className="text-[9px]">Videos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="live"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <Radio className="h-5 w-5" />
                  <span className="text-[9px]">Live</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pets"
                  className="flex flex-col items-center gap-0.5 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-700 p-1 rounded-md transition-all"
                >
                  <Dog className="h-5 w-5" />
                  <span className="text-[9px]">Pets</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              <div className="max-w-5xl mx-auto">
                <TabsContent value="home" className="mt-0">
                  <PostsTab username={username} />
                </TabsContent>
                <TabsContent value="chats" className="mt-0">
                  <ChatsTab username={username} />
                </TabsContent>
                <TabsContent value="communities" className="mt-0">
                  <CommunitiesTab username={username} />
                </TabsContent>
                <TabsContent value="profile" className="mt-0">
                  <ProfileTab username={username} />
                </TabsContent>
                <TabsContent value="calling" className="mt-0">
                  <CallingTab username={username} />
                </TabsContent>
                <TabsContent value="marketplace" className="mt-0">
                  <MarketplaceTab username={username} />
                </TabsContent>
                <TabsContent value="videos" className="mt-0">
                  <VideosTab username={username} />
                </TabsContent>
                <TabsContent value="live" className="mt-0">
                  <LiveStreamingTab username={username} />
                </TabsContent>
                <TabsContent value="pets" className="mt-0">
                  <VirtualPetsTab username={username} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
