"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Phone, PhoneCall, Video } from "lucide-react"
import { useUser } from "@/context/user-context"
import { persistentStorage } from "@/lib/persistent-storage"
import type { CallData } from "@/lib/types"

interface CallButtonProps {
  targetUser: string
  type: "voice" | "video"
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
}

export default function CallButton({ targetUser, type, variant = "ghost", size = "sm" }: CallButtonProps) {
  const { username } = useUser()
  const [isInCall, setIsInCall] = useState(false)
  const [activeCall, setActiveCall] = useState<CallData | null>(null)

  useEffect(() => {
    // Check for active call on mount
    const currentCall = persistentStorage.getActiveCall()
    if (currentCall) {
      setActiveCall(currentCall)
      setIsInCall(true)
    }

    // Listen for call state changes
    const handleCallStateChange = (event: CustomEvent) => {
      const callData = event.detail as CallData | null
      setActiveCall(callData)
      setIsInCall(!!callData)
    }

    window.addEventListener("callStateChanged", handleCallStateChange as EventListener)
    return () => window.removeEventListener("callStateChanged", handleCallStateChange as EventListener)
  }, [])

  const handleCall = () => {
    if (!username || isInCall) return

    const callData: CallData = {
      id: Date.now().toString(),
      caller: username,
      recipient: targetUser,
      type,
      status: "calling",
      startTime: Date.now(),
    }

    persistentStorage.saveActiveCall(callData)
    setActiveCall(callData)
    setIsInCall(true)

    // Simulate call connection after 3 seconds
    setTimeout(() => {
      const updatedCall = { ...callData, status: "connected" as const }
      persistentStorage.saveActiveCall(updatedCall)
      setActiveCall(updatedCall)
    }, 3000)
  }

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
        setActiveCall(null)
        setIsInCall(false)
      }, 1000)
    }
  }

  if (
    isInCall &&
    activeCall &&
    (activeCall.caller === username || activeCall.recipient === username) &&
    (activeCall.caller === targetUser || activeCall.recipient === targetUser)
  ) {
    return (
      <Button variant="destructive" size={size} onClick={handleEndCall} className="animate-pulse">
        <PhoneCall className="h-4 w-4" />
        {activeCall.status === "calling" ? "Calling..." : "End Call"}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCall}
      disabled={isInCall || !username || username === targetUser}
      title={`${type === "voice" ? "Voice" : "Video"} call ${targetUser}`}
    >
      {type === "voice" ? <Phone className="h-4 w-4" /> : <Video className="h-4 w-4" />}
    </Button>
  )
}
