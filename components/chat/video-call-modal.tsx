"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"
import type { Chat } from "@/lib/types"

interface VideoCallModalProps {
  chat: Chat
  onClose: () => void
}

export default function VideoCallModal({ chat, onClose }: VideoCallModalProps) {
  const { username } = useUser()
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: isMicOn,
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // In a real app, you would connect to WebRTC service here
        console.log("Video call started with:", chat.name)
      } catch (error) {
        console.error("Error accessing media devices:", error)
      }
    }

    startVideo()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [chat.name, isMicOn, isVideoOn])

  const toggleMic = () => {
    setIsMicOn(!isMicOn)

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn
      })
    }
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn
      })
    }
  }

  const endCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-muted/50">
          <DialogTitle>Call with {chat.name}</DialogTitle>
        </DialogHeader>

        <div className="relative h-[400px] bg-black">
          {/* Remote video (full size) */}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-1/4 h-1/4 border-2 border-background overflow-hidden rounded-md">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="p-4 flex justify-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={toggleMic}>
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endCall}>
            <PhoneOff className="h-5 w-5" />
          </Button>

          <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={toggleVideo}>
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
