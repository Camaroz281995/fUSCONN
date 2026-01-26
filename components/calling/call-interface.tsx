"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PhoneOff, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"

interface CallInterfaceProps {
  recipientUsername: string
  callType: "voice" | "video"
  onEndCall: () => void
}

export default function CallInterface({ recipientUsername, callType, onEndCall }: CallInterfaceProps) {
  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">("calling")
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(callType === "video")
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTime = useRef<number>(0)

  // Simulate call connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus("connected")
      callStartTime.current = Date.now()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callStatus])

  // Initialize camera for video calls
  useEffect(() => {
    if (callType === "video" && callStatus === "connected") {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => console.error("Error accessing camera:", err))
    }
  }, [callType, callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn)
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const endCall = () => {
    setCallStatus("ended")
    onEndCall()
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black ${isFullscreen ? "" : "bg-black/90"} flex items-center justify-center`}
    >
      <Card className={`${isFullscreen ? "w-full h-full" : "w-full max-w-2xl"} bg-black text-white border-gray-800`}>
        <CardContent className="p-0 h-full">
          {callType === "video" && callStatus === "connected" ? (
            <div className="relative h-full min-h-[500px]">
              {/* Remote video (main) */}
              <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
                <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
                {/* Placeholder for remote video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="text-4xl bg-gray-700">
                      {recipientUsername.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Local video (picture-in-picture) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-600">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <CameraOff className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Call info overlay */}
              <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">{recipientUsername}</span>
                  <span className="text-xs text-gray-300">
                    {callStatus === "calling" ? "Calling..." : formatDuration(callDuration)}
                  </span>
                </div>
              </div>

              {/* Fullscreen toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-40 text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          ) : (
            /* Voice call or calling state */
            <div className="flex flex-col items-center justify-center h-[500px] p-8">
              <Avatar className="h-32 w-32 mb-6">
                <AvatarFallback className="text-4xl bg-gray-700">
                  {recipientUsername.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-semibold mb-2">{recipientUsername}</h2>

              <div className="flex items-center gap-2 mb-8">
                {callStatus === "calling" && (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Calling...</span>
                  </>
                )}
                {callStatus === "connected" && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">{formatDuration(callDuration)}</span>
                  </>
                )}
              </div>

              {callType === "video" && callStatus === "connected" && (
                <div className="w-64 h-48 bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover rounded-lg" autoPlay playsInline muted />
                  {!isCameraOn && (
                    <div className="absolute flex items-center justify-center">
                      <CameraOff className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Call controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {callType === "video" && (
              <Button
                variant={isCameraOn ? "secondary" : "destructive"}
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={toggleCamera}
              >
                {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
              </Button>
            )}

            <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={endCall}>
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              variant={isSpeakerOn ? "default" : "secondary"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleSpeaker}
            >
              {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
