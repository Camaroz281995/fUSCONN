"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Video, Mic, MicOff, VideoIcon, VideoOff, PhoneOff, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface CallHistory {
  id: string
  caller: string
  recipient: string
  type: "voice" | "video"
  duration: number
  timestamp: number
  status: "completed" | "missed" | "declined"
}

interface CallingTabProps {
  username: string
}

export default function CallingTab({ username }: CallingTabProps) {
  const [callHistory, setCallHistory] = useState<CallHistory[]>([])
  const [activeCall, setActiveCall] = useState<CallHistory | null>(null)
  const [showNewCallDialog, setShowNewCallDialog] = useState(false)
  const [callUsername, setCallUsername] = useState("")
  const [callType, setCallType] = useState<"voice" | "video">("voice")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    loadCallHistory()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeCall])

  const loadCallHistory = () => {
    try {
      const stored = localStorage.getItem("fusconn-call-history")
      if (stored) {
        setCallHistory(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading call history:", error)
    }
  }

  const saveCallHistory = (updatedHistory: CallHistory[]) => {
    localStorage.setItem("fusconn-call-history", JSON.stringify(updatedHistory))
    setCallHistory(updatedHistory)
  }

  const startCall = async (type: "voice" | "video") => {
    if (!username) {
      alert("Please sign in to make calls")
      return
    }

    if (!callUsername.trim()) {
      alert("Please enter a username to call")
      return
    }

    if (callUsername.toLowerCase() === username.toLowerCase()) {
      alert("You can't call yourself")
      return
    }

    try {
      const constraints = {
        audio: true,
        video: type === "video",
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current && type === "video") {
        videoRef.current.srcObject = stream
      }

      const newCall: CallHistory = {
        id: `call-${Date.now()}`,
        caller: username,
        recipient: callUsername,
        type,
        duration: 0,
        timestamp: Date.now(),
        status: "completed",
      }

      setActiveCall(newCall)
      setCallDuration(0)
      setShowNewCallDialog(false)
      setCallUsername("")
    } catch (error) {
      console.error("Error starting call:", error)
      alert("Could not access camera/microphone. Please check permissions.")
    }
  }

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (activeCall) {
      const completedCall = {
        ...activeCall,
        duration: callDuration,
      }

      const updatedHistory = [completedCall, ...callHistory]
      saveCallHistory(updatedHistory)
    }

    setActiveCall(null)
    setCallDuration(0)
    setIsMuted(false)
    setIsVideoOff(false)
  }

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (!username) {
    return (
      <Card className="bg-white shadow-md">
        <CardContent className="py-12 text-center">
          <Phone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to make calls</p>
        </CardContent>
      </Card>
    )
  }

  if (activeCall) {
    return (
      <Card className="bg-white shadow-md">
        <CardContent className="py-8">
          <div className="text-center space-y-6">
            {activeCall.type === "video" ? (
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-4xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ) : (
              <Avatar className="h-32 w-32 mx-auto">
                <AvatarFallback className="text-5xl">{activeCall.recipient.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}

            <div>
              <h2 className="text-2xl font-bold">@{activeCall.recipient}</h2>
              <p className="text-lg text-muted-foreground">{formatDuration(callDuration)}</p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant={isMuted ? "destructive" : "outline"}
                className="rounded-full h-16 w-16"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {activeCall.type === "video" && (
                <Button
                  size="lg"
                  variant={isVideoOff ? "destructive" : "outline"}
                  className="rounded-full h-16 w-16"
                  onClick={toggleVideo}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
                </Button>
              )}

              <Button size="lg" variant="destructive" className="rounded-full h-16 w-16" onClick={endCall}>
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Phone className="h-6 w-6" />
              Calling
            </CardTitle>
            <Dialog open={showNewCallDialog} onOpenChange={setShowNewCallDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Call
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Call</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Enter username to call..."
                    value={callUsername}
                    onChange={(e) => setCallUsername(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 bg-transparent"
                      onClick={() => {
                        setCallType("voice")
                        startCall("voice")
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Phone className="h-6 w-6" />
                        <span>Voice Call</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 bg-transparent"
                      onClick={() => {
                        setCallType("video")
                        startCall("video")
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Video className="h-6 w-6" />
                        <span>Video Call</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Call History</CardTitle>
        </CardHeader>
        <CardContent>
          {callHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No call history yet</p>
          ) : (
            <div className="space-y-2">
              {callHistory
                .filter((call) => call.caller === username || call.recipient === username)
                .map((call) => {
                  const isOutgoing = call.caller === username
                  const otherUser = isOutgoing ? call.recipient : call.caller
                  return (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{otherUser.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">@{otherUser}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {call.type === "video" ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                            <span>{isOutgoing ? "Outgoing" : "Incoming"}</span>
                            <span>•</span>
                            <span>{formatDuration(call.duration)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(call.timestamp)}</span>
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
