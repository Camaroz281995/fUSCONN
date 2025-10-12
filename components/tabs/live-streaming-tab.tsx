"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Radio, Search, Play, Users, Eye } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import type { LiveStream } from "@/lib/types"

export default function LiveStreamingTab() {
  const { username } = useUser()
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    loadStreams()

    // Simulate P2P stream discovery
    const interval = setInterval(() => {
      syncP2PStreams()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadStreams = () => {
    const allStreams = persistentStorage.getLiveStreams()
    setStreams(allStreams.filter((stream) => stream.isActive))
  }

  const syncP2PStreams = () => {
    // Simulate P2P stream synchronization
    loadStreams()
  }

  const startStream = () => {
    if (!username) return

    const newStream: LiveStream = {
      id: Date.now().toString(),
      streamer: username,
      title: `${username}'s Live Stream`,
      description: "Live from P2P network",
      viewers: 0,
      isActive: true,
      startTime: Date.now(),
      category: "General",
    }

    persistentStorage.addLiveStream(newStream)
    setIsLive(true)
    loadStreams()
  }

  const stopStream = () => {
    if (!username) return

    const userStream = streams.find((s) => s.streamer === username)
    if (userStream) {
      persistentStorage.endLiveStream(userStream.id)
      setIsLive(false)
      loadStreams()
    }
  }

  const joinStream = (streamId: string) => {
    // Simulate joining a P2P stream
    console.log("Joining P2P stream:", streamId)
  }

  const filteredStreams = streams.filter(
    (stream) =>
      stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.streamer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDuration = (startTime: number) => {
    const duration = Date.now() - startTime
    const minutes = Math.floor(duration / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              P2P Live Streams
            </div>
            {!isLive ? (
              <Button size="sm" onClick={startStream}>
                <Play className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={stopStream}>
                End Stream
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search live streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* My Stream Status */}
      {isLive && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="font-semibold text-sm">You're Live!</p>
                <p className="text-xs text-muted-foreground">Broadcasting to P2P network</p>
              </div>
              <Badge variant="destructive" className="text-xs">
                LIVE
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Streams */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Now ({filteredStreams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStreams.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No live streams</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No streams match your search" : "Be the first to go live!"}
              </p>
              {!isLive && (
                <Button onClick={startStream}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Streaming
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStreams.map((stream) => (
                <div key={stream.id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center relative">
                      <Play className="h-8 w-8 text-white" />
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="destructive" className="text-xs px-1">
                          LIVE
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{stream.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{stream.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {stream.streamer.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">@{stream.streamer}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{stream.viewers} viewers</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {stream.category}
                            </Badge>
                            <span>{formatDuration(stream.startTime)}</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => joinStream(stream.id)} disabled={stream.streamer === username}>
                          <Eye className="h-3 w-3 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
