"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Video, Mic, MicOff, VideoIcon, VideoOff, PhoneOff, Plus } from 'lucide-react'
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
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadCallHistory()
    
    if (username) {
      startSignalPolling()
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [username])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeCall])

  const startSignalPolling = () => {
    pollingIntervalRef.current = setInterval(async () => {
      if (!username) return
      
      try {
        const response = await fetch(`/api/webrtc/signal?username=${username}`)
        const data = await response.json()
        
        if (data.signals && data.signals.length > 0) {
          for (const signal of data.signals) {
            await handleIncomingSignal(signal)
          }
        }
      } catch (error) {
        console.error("Error polling for signals:", error)
      }
    }, 2000) // Poll every 2 seconds
  }

  const handleIncomingSignal = async (signal: any) => {
    if (!peerConnectionRef.current) {
      // Incoming call - create peer connection
      await setupPeerConnection(signal.from, false)
    }
    
    const pc = peerConnectionRef.current
    if (!pc) return

    try {
      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.signal))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        // Send answer back
        await fetch("/api/webrtc/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: username,
            to: signal.from,
            signal: answer,
            type: "answer",
          }),
        })
        
        // Show incoming call
        const newCall: CallHistory = {
          id: `call-${Date.now()}`,
          caller: signal.from,
          recipient: username,
          type: "video",
          duration: 0,
          timestamp: Date.now(),
          status: "completed",
        }
        setActiveCall(newCall)
        setCallDuration(0)
      } else if (signal.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.signal))
      } else if (signal.type === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(signal.signal))
      }
    } catch (error) {
      console.error("Error handling signal:", error)
    }
  }

  const setupPeerConnection = async (recipient: string, initiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    })

    peerConnectionRef.current = pc

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        fetch("/api/webrtc/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: username,
            to: recipient,
            signal: event.candidate,
            type: "ice-candidate",
          }),
        })
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // Get local media
    const constraints = {
      audio: true,
      video: callType === "video",
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStreamRef.current = stream

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }

    // Add local stream to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream)
    })

    if (initiator) {
      // Create and send offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
      await fetch("/api/webrtc/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: username,
          to: recipient,
          signal: offer,
          type: "offer",
        }),
      })
    }
  }

  const loadCallHistory = async () => {
    if (!username) return

    try {
      const response = await fetch(`/api/calls?username=${username}`)
      const data = await response.json()
      if (data.calls) {
        setCallHistory(data.calls)
      }
    } catch (error) {
      console.error("Error loading call history:", error)
    }
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
      await setupPeerConnection(callUsername, true)

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

  const endCall = async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    if (activeCall) {
      try {
        await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caller: activeCall.caller,
            recipient: activeCall.recipient,
            type: activeCall.type,
            duration: callDuration,
            status: "completed",
          }),
        })

        await loadCallHistory()
      } catch (error) {
        console.error("Error saving call:", error)
      }
    }

    setActiveCall(null)
    setCallDuration(0)
    setIsMuted(false)
    setIsVideoOff(false)
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
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
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute bottom-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white shadow-lg" 
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-4xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarFallback className="text-5xl">
                    {(activeCall.caller === username ? activeCall.recipient : activeCall.caller).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <audio ref={remoteVideoRef} autoPlay />
                <audio ref={localVideoRef} autoPlay muted />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold">@{activeCall.caller === username ? activeCall.recipient : activeCall.caller}</h2>
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
