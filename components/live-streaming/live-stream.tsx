"use client"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatNumber, formatDate } from "@/lib/utils"
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share,
  Users,
  Eye,
  Send,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react"
import type { LiveStream as LiveStreamType } from "@/lib/types"

interface LiveStreamProps {
  stream: LiveStreamType
  onBack: () => void
}

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
  isHighlighted?: boolean
}

export default function LiveStream({ stream, onBack }: LiveStreamProps) {
  const { username } = useUser()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      username: "viewer123",
      message: "Great stream! Love the content",
      timestamp: Date.now() - 300000,
    },
    {
      id: "2",
      username: "fan_user",
      message: "How long have you been doing this?",
      timestamp: Date.now() - 240000,
    },
    {
      id: "3",
      username: "stream_lover",
      message: "This is amazing! Keep it up!",
      timestamp: Date.now() - 180000,
      isHighlighted: true,
    },
    {
      id: "4",
      username: "curious_viewer",
      message: "What's your setup like?",
      timestamp: Date.now() - 120000,
    },
    {
      id: "5",
      username: "regular_watcher",
      message: "Been watching for 30 minutes, love it!",
      timestamp: Date.now() - 60000,
    },
  ])

  const [currentViewers] = useState(stream.viewers + Math.floor(Math.random() * 50))

  const handleSendMessage = () => {
    if (!username || !chatMessage.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username,
      message: chatMessage.trim(),
      timestamp: Date.now(),
    }

    setChatMessages((prev) => [...prev, newMessage])
    setChatMessage("")
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream.title,
        text: `Check out this live stream by ${stream.streamer}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Stream link copied to clipboard!")
    }
  }

  const streamDuration = Math.floor((Date.now() - stream.startTime) / 60000)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
      {/* Video Player */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
              {/* Placeholder for video stream */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">📹</div>
                  <h3 className="text-2xl font-bold mb-2">Live Stream</h3>
                  <p className="text-lg opacity-90">{stream.title}</p>
                </div>
              </div>

              {/* Live Badge */}
              <Badge className="absolute top-4 left-4 bg-red-500">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                LIVE
              </Badge>

              {/* Viewer Count */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {formatNumber(currentViewers)}
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                  </Button>
                  <span className="text-white text-sm">{streamDuration}m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4 text-white" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Maximize className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{stream.title}</h2>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{stream.streamer.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{stream.streamer}</span>
                    </div>
                    <Badge variant="secondary">{stream.category}</Badge>
                  </div>
                  <p className="text-muted-foreground">{stream.description}</p>
                </div>
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button onClick={handleFollow} variant={isFollowing ? "default" : "outline"}>
                  <Users className="h-4 w-4 mr-1" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button onClick={handleLike} variant="ghost" className={isLiked ? "text-red-500" : ""}>
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                  Like
                </Button>
                <Button onClick={handleShare} variant="ghost">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </div>
              <Badge variant="secondary" className="text-xs">
                {formatNumber(currentViewers)} viewers
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded ${msg.isHighlighted ? "bg-yellow-100 border border-yellow-300" : ""}`}
                  >
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {msg.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-sm">{msg.username}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Chat Input */}
            <div className="p-4">
              {username ? (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Say something..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">Sign in to chat</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
