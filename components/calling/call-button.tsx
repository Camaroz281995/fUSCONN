"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Phone, Video, ChevronDown } from "lucide-react"
import CallInterface from "./call-interface"

interface CallButtonProps {
  recipientUsername: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function CallButton({ recipientUsername, variant = "ghost", size = "icon" }: CallButtonProps) {
  const [activeCall, setActiveCall] = useState<{ type: "voice" | "video"; recipient: string } | null>(null)

  const startVoiceCall = () => {
    setActiveCall({ type: "voice", recipient: recipientUsername })
  }

  const startVideoCall = () => {
    setActiveCall({ type: "video", recipient: recipientUsername })
  }

  const endCall = () => {
    setActiveCall(null)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="relative">
            <Phone className="h-4 w-4" />
            {size !== "icon" && <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={startVoiceCall}>
            <Phone className="h-4 w-4 mr-2" />
            Voice Call
          </DropdownMenuItem>
          <DropdownMenuItem onClick={startVideoCall}>
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeCall && (
        <CallInterface recipientUsername={activeCall.recipient} callType={activeCall.type} onEndCall={endCall} />
      )}
    </>
  )
}
