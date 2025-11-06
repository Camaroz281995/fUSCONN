"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateChatModalProps {
  onClose: () => void
  onChatCreated: () => void
}

export default function CreateChatModal({ onClose, onChatCreated }: CreateChatModalProps) {
  const { username } = useUser()
  const [chatName, setChatName] = useState("")
  const [participants, setParticipants] = useState("")
  const [isGroup, setIsGroup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      setError("Please set your username in the Profile tab")
      return
    }

    if (!chatName.trim()) {
      setError("Chat name is required")
      return
    }

    if (!isGroup && !participants.trim()) {
      setError("Please enter at least one participant username")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const participantsList = participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)

      if (!isGroup && participantsList.length === 0) {
        throw new Error("Please enter at least one participant username")
      }

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: chatName,
          creator: username,
          participants: [...new Set([username, ...participantsList])],
          isGroup,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create chat")
      }

      onChatCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>Start a new conversation with other users</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="chat-name">Chat Name</Label>
            <Input
              id="chat-name"
              placeholder={isGroup ? "Group name" : "Chat name or username"}
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is-group" checked={isGroup} onCheckedChange={(checked) => setIsGroup(checked === true)} />
            <Label htmlFor="is-group">This is a group chat</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants">{isGroup ? "Participants (comma separated)" : "Username to chat with"}</Label>
            <Input
              id="participants"
              placeholder="username1, username2, ..."
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Enter usernames separated by commas</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Chat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
