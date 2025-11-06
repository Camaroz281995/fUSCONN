"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CommentFormProps {
  postId: string
  onCommentAdded: () => void
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { username } = useUser()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      setError("Please set your username in the Profile tab")
      return
    }

    if (!content.trim()) {
      setError("Comment cannot be empty")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, content }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add comment")
      }

      setContent("")
      onCommentAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting || !username}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting || !username} size="sm">
          {isSubmitting ? "..." : "Post"}
        </Button>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
      {!username && <p className="text-amber-500 text-xs">Set your username in the Profile tab to comment</p>}
    </form>
  )
}
