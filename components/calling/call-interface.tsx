"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Minimize2 } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import type { CallData } from "@/lib/types"

export default function CallInterface() {
  const { username } = useUser()
  const [activeCall, setActiveCall] = useState<CallData | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Check for active call on mount
    const currentCall = persistentStorage.getActiveCall()
    if (currentCall) {
      setActiveCall(currentCall)
    }

    // Listen for call state changes
    const handleCallStateChange = (event: CustomEvent) => {
      const callData = event.detail as CallData | null
      setActiveCall(callData)

      if (!callData) {
        setCallDuration(0)
        setIsMuted(false)
        setIsVideoOn(true)
        setIsSpeakerOn(false)
        setIsMinimized(false)
      }
    }

    window.addEventListener("callStateChanged", handleCallStateChange as EventListener)
    return () => window.removeEventListener("callStateChanged", handleCallStateChange as EventListener)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (activeCall && activeCall.status === "connected") {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeCall.startTime) / 1000)
        setCallDuration(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeCall])

  const handleEndCall = () => {
    if (activeCall) {
      const endedCall = {
        ...activeCall,
        status: "ended" as const,
        endTime: Date.now(),
      }
      persistentStorage.saveActiveCall(endedCall)

      // Clear call after a brief moment
      setTimeout(() => {
        persistentStorage.clearActiveCall()
      }, 1000)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getOtherUser = () => {
    if (!activeCall || !username) return ""
    return activeCall.caller === username ? activeCall.recipient : activeCall.caller
  }

  if (!activeCall || !username) return null

  const otherUser = getOtherUser()

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={persistentStorage.getProfilePhoto(otherUser) || undefined} />
                  <AvatarFallback className="bg-white/20 text-white">{getInitials(otherUser)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{otherUser}</p>
                  <p className="text-xs opacity-90">
                    {activeCall.status === "calling" ? "Calling..." : formatDuration(callDuration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(false)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={handleEndCall}>
                  <PhoneOff className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <CardContent className="p-6 text-center">
          <div className="flex justify-between items-start mb-6">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              {activeCall.type === "voice" ? "Voice Call" : "Video Call"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-white/20">
              <AvatarImage src={persistentStorage.getProfilePhoto(otherUser) || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                {getInitials(otherUser)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mb-2">{otherUser}</h2>
            <p className="text-slate-300">
              {activeCall.status === "calling" ? (
                <span className="animate-pulse">Calling...</span>
              ) : activeCall.status === "connected" ? (
                formatDuration(callDuration)
              ) : (
                "Call ended"
              )}
            </p>
          </div>

          {activeCall.status === "connected" && (
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full h-12 w-12 p-0"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {activeCall.type === "video" && (
                <Button
                  variant={!isVideoOn ? "destructive" : "secondary"}
                  size="lg"
                  className="rounded-full h-12 w-12 p-0"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              )}

              <Button
                variant={isSpeakerOn ? "default" : "secondary"}
                size="lg"
                className="rounded-full h-12 w-12 p-0"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            </div>
          )}

          <Button variant="destructive" size="lg" className="rounded-full h-14 w-14 p-0" onClick={handleEndCall}>
            <PhoneOff className="h-6 w-6" />
          </Button>

          {activeCall.status === "calling" && (
            <p className="text-xs text-slate-400 mt-4">
              {activeCall.caller === username ? "Calling..." : "Incoming call"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
