"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Phone, Video, PhoneCall, Search, Plus, PhoneOff } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import { generateId, formatTime } from "@/lib/utils"
import type { CallRecord, User } from "@/lib/types"

export default function CallingTab() {
  const { username } = useUser()
  const [callHistory, setCallHistory] = useState<CallRecord[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [callUsername, setCallUsername] = useState("")
  const [showCallDialog, setShowCallDialog] = useState(false)

  useEffect(() => {
    loadCallHistory()
    loadUsers()

    // Simulate P2P call sync
    const interval = setInterval(() => {
      syncP2PCalls()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const loadCallHistory = () => {
    if (!username) return
    const history = persistentStorage.getCallHistory(username)
    setCallHistory(history)
  }

  const loadUsers = () => {
    const allUsers = persistentStorage.getUsers()
    setUsers(allUsers.filter((u) => u.username !== username))
  }

  const syncP2PCalls = () => {
    // Simulate P2P call synchronization
    loadCallHistory()
  }

  const initiateCall = (targetUser: string, type: "voice" | "video") => {
    if (!username) return

    const call: CallRecord = {
      id: generateId(),
      caller: username,
      recipient: targetUser,
      type,
      status: "calling",
      startTime: Date.now(),
      duration: 0,
    }

    setActiveCall(call)
    persistentStorage.addCallRecord(call)

    // Simulate P2P call initiation
    broadcastCallP2P(call)

    // Simulate call connection after 3 seconds
    setTimeout(() => {
      if (activeCall?.id === call.id) {
        const connectedCall = { ...call, status: "connected" as const }
        setActiveCall(connectedCall)
        persistentStorage.updateCallRecord(connectedCall)
      }
    }, 3000)
  }

  const endCall = () => {
    if (!activeCall) return

    const endTime = Date.now()
    const duration = endTime - activeCall.startTime
    const endedCall = {
      ...activeCall,
      status: "ended" as const,
      endTime,
      duration,
    }

    persistentStorage.updateCallRecord(endedCall)
    setActiveCall(null)
    loadCallHistory()
  }

  const broadcastCallP2P = (call: CallRecord) => {
    // Simulate P2P call broadcasting
    console.log("Broadcasting call to P2P network:", call)
  }

  const startCallWithUsername = (type: "voice" | "video") => {
    if (!callUsername.trim()) return

    const userExists = users.some((u) => u.username.toLowerCase() === callUsername.toLowerCase())

    if (userExists) {
      initiateCall(callUsername, type)
      setShowCallDialog(false)
      setCallUsername("")
    } else {
      alert("User not found in the network")
    }
  }

  const getCallStatusText = (call: CallRecord) => {
    switch (call.status) {
      case "calling":
        return "Calling..."
      case "connected":
        return "Connected"
      case "ended":
        return `${Math.floor(call.duration / 1000)}s`
      case "missed":
        return "Missed"
      default:
        return "Unknown"
    }
  }

  const filteredHistory = callHistory.filter(
    (call) =>
      call.caller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.recipient.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (activeCall) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-8">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={persistentStorage.getProfilePhoto(activeCall.recipient) || undefined} />
                <AvatarFallback className="text-2xl">{activeCall.recipient.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mb-2">@{activeCall.recipient}</h2>
              <p className="text-muted-foreground">{activeCall.status === "calling" ? "Calling..." : "Connected"}</p>
              {activeCall.status === "connected" && (
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.floor((Date.now() - activeCall.startTime) / 1000)}s
                </p>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {activeCall.type === "video" && (
                <Button variant="outline" size="lg" className="rounded-full h-16 w-16 bg-transparent">
                  <Video className="h-6 w-6" />
                </Button>
              )}
              <Button variant="destructive" size="lg" className="rounded-full h-16 w-16" onClick={endCall}>
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Calls
            </div>
            <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Start Call</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Input
                      placeholder="Enter username..."
                      value={callUsername}
                      onChange={(e) => setCallUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startCallWithUsername("voice")}
                      className="flex-1"
                      disabled={!callUsername.trim()}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Voice Call
                    </Button>
                    <Button
                      onClick={() => startCallWithUsername("video")}
                      className="flex-1"
                      disabled={!callUsername.trim()}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search call history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Call Buttons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Call</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {users.slice(0, 4).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={persistentStorage.getProfilePhoto(user.username) || undefined} />
                    <AvatarFallback className="text-xs">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">@{user.username}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => initiateCall(user.username, "voice")}>
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => initiateCall(user.username, "video")}>
                    <Video className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PhoneCall className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No call history yet</p>
              <p className="text-xs">Start your first P2P call</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((call) => {
                const otherUser = call.caller === username ? call.recipient : call.caller
                const isOutgoing = call.caller === username

                return (
                  <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={persistentStorage.getProfilePhoto(otherUser) || undefined} />
                      <AvatarFallback>{otherUser.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">@{otherUser}</p>
                        {call.type === "video" ? (
                          <Video className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Phone className="h-3 w-3 text-muted-foreground" />
                        )}
                        {call.status === "missed" && (
                          <Badge variant="destructive" className="text-xs">
                            Missed
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isOutgoing ? "Outgoing" : "Incoming"} • {formatTime(call.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{getCallStatusText(call)}</p>
                      <div className="flex gap-1 mt-1">
                        <Button variant="ghost" size="sm" onClick={() => initiateCall(otherUser, "voice")}>
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => initiateCall(otherUser, "video")}>
                          <Video className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
