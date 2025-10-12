"use client"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import AuthPage from "@/components/auth/auth-page"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Users, MessageCircle, User, Phone, ShoppingBag, Radio, Heart, LogOut } from "lucide-react"

// Import tab components
import GlobalFeed from "@/components/global-feed/global-feed"
import CommunitiesTab from "@/components/tabs/communities-tab"
import MessagingTab from "@/components/tabs/messaging-tab"
import ProfileTab from "@/components/tabs/profile-tab"
import CallingTab from "@/components/tabs/calling-tab"
import MarketplaceTab from "@/components/tabs/marketplace-tab"
import LiveStreamingTab from "@/components/tabs/live-streaming-tab"
import VirtualPetsTab from "@/components/tabs/virtual-pets-tab"

export default function HomePage() {
  const { user, username, profilePhoto, logout } = useUser()
  const [activeTab, setActiveTab] = useState("feed")

  if (!user) {
    return <AuthPage />
  }

  const tabs = [
    { id: "feed", label: "Feed", icon: Home },
    { id: "communities", label: "Groups", icon: Users },
    { id: "messaging", label: "Chat", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: User },
    { id: "calling", label: "Calls", icon: Phone },
    { id: "marketplace", label: "Shop", icon: ShoppingBag },
    { id: "live", label: "Live", icon: Radio },
    { id: "pets", label: "Pets", icon: Heart },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "feed":
        return <GlobalFeed />
      case "communities":
        return <CommunitiesTab />
      case "messaging":
        return <MessagingTab />
      case "profile":
        return <ProfileTab />
      case "calling":
        return <CallingTab />
      case "marketplace":
        return <MarketplaceTab />
      case "live":
        return <LiveStreamingTab />
      case "pets":
        return <VirtualPetsTab />
      default:
        return <GlobalFeed />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/fuscon-logo.png" alt="Fuscon" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fuscon
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profilePhoto || undefined} />
                <AvatarFallback className="text-xs">{username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-20">
        <div className="p-4">{renderTabContent()}</div>
      </main>

      {/* Bottom Navigation - Single Row */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 p-2 min-w-0 flex-1 ${
                    isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
