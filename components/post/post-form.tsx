"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileVideo, ImageIcon, AlertCircle, Smile } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import VideoUploadField from "@/components/video/video-upload-field"
import PhotoUploadField from "@/components/photo/photo-upload-field"
import GifSearch from "@/components/gif/gif-search"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { generateId } from "@/lib/utils"

interface PostFormProps {
  onPostCreated: () => void
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { username } = useUser()
  const [content, setContent] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [gifUrl, setGifUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [postType, setPostType] = useState("text")
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [postSuccess, setPostSuccess] = useState(false)
  const [showGifSearch, setShowGifSearch] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([])
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionSuggestionsRef = useRef<HTMLDivElement>(null)

  // Mock user data for @mention suggestions
  const mockUsers = ["john", "sarah", "mike", "emma", "alex", "taylor", "jordan"]

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // Check for @mentions
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = newContent.substring(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      setMentionQuery(query)

      // Filter users based on query
      const filteredUsers = mockUsers.filter((user) => user.toLowerCase().startsWith(query))

      setMentionSuggestions(filteredUsers)
      setShowMentionSuggestions(filteredUsers.length > 0)
    } else {
      setShowMentionSuggestions(false)
    }
  }

  const handleSelectMention = (username: string) => {
    if (!textareaRef.current) return

    const cursorPosition = textareaRef.current.selectionStart
    const textBeforeCursor = content.substring(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const startPos = cursorPosition - mentionMatch[0].length
      const newContent = content.substring(0, startPos) + `@${username} ` + content.substring(cursorPosition)

      setContent(newContent)

      // Set cursor position after the inserted mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = startPos + username.length + 2 // +2 for @ and space
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newPosition, newPosition)
        }
      }, 0)
    }

    setShowMentionSuggestions(false)
  }

  // Close mention suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionSuggestionsRef.current &&
        !mentionSuggestionsRef.current.contains(event.target as Node) &&
        event.target !== textareaRef.current
      ) {
        setShowMentionSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      setError("Please set your username in the Profile tab")
      return
    }

    if (!content.trim() && postType === "text") {
      setError("Post content is required")
      return
    }

    if (postType === "video" && !videoUrl) {
      setError("Please upload a video")
      return
    }

    if (postType === "photo" && !photoUrl) {
      setError("Please upload a photo")
      return
    }

    if (postType === "gif" && !gifUrl) {
      setError("Please select a GIF")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      setPostSuccess(false)

      // Extract mentions from content
      const mentions = extractMentions(content)

      const postData = {
        username,
        content,
        type: postType,
        videoUrl: postType === "video" ? videoUrl : undefined,
        photoUrl: postType === "photo" ? photoUrl : undefined,
        gifUrl: postType === "gif" ? gifUrl : undefined,
        mentions,
      }

      console.log("Submitting post data:", postData)

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create post")
      }

      const responseData = await response.json()
      console.log("Post created successfully:", responseData)

      // Create notifications for mentions
      if (mentions.length > 0) {
        await Promise.all(
          mentions.map(async (mentionedUser) => {
            // Skip if mentioned user is the same as poster
            if (mentionedUser === username) return

            try {
              await fetch("/api/notifications", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "mention",
                  username,
                  targetUsername: mentionedUser,
                  content: `${username} mentioned you in a post`,
                  postId: responseData.post.id || generateId(), // Use actual post ID if available
                }),
              })
            } catch (error) {
              console.error("Error creating mention notification:", error)
            }
          }),
        )
      }

      // Show success message
      setPostSuccess(true)

      // Reset form after a short delay
      setTimeout(() => {
        setContent("")
        setVideoUrl("")
        setPhotoUrl("")
        setGifUrl("")
        setVideoPreview(null)
        setPhotoPreview(null)
        setPostType("text")
        setPostSuccess(false)
        onPostCreated()
      }, 2000)
    } catch (err) {
      console.error("Error creating post:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVideoUploaded = (url: string) => {
    console.log("Video uploaded:", url)
    setVideoUrl(url)
    setVideoPreview(url)
  }

  const handlePhotoUploaded = (url: string) => {
    console.log("Photo uploaded:", url)
    setPhotoUrl(url)
    setPhotoPreview(url)
  }

  const handleGifSelected = (url: string) => {
    console.log("GIF selected:", url)
    setGifUrl(url)
    setShowGifSearch(false)
  }

  return (
    <Card className="card-transparent">
      <CardContent className="pt-6">
        <Tabs value={postType} onValueChange={setPostType} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 bg-background/70 backdrop-blur-md">
            <TabsTrigger value="text">Text Post</TabsTrigger>
            <TabsTrigger value="photo">Photo Post</TabsTrigger>
            <TabsTrigger value="video">Video Post</TabsTrigger>
            <TabsTrigger value="gif">GIF Post</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TabsContent value="text" className="mt-0">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    username
                      ? "What's on your mind? Use @username to mention someone"
                      : "Set your username in the Profile tab first"
                  }
                  value={content}
                  onChange={handleContentChange}
                  rows={4}
                  disabled={isSubmitting || !username}
                />

                {showMentionSuggestions && (
                  <div
                    ref={mentionSuggestionsRef}
                    className="absolute z-10 mt-1 w-full max-h-40 overflow-auto bg-background border rounded-md shadow-md"
                  >
                    {mentionSuggestions.map((user) => (
                      <div
                        key={user}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectMention(user)}
                      >
                        @{user}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="photo" className="mt-0 space-y-4">
              <PhotoUploadField onPhotoUploaded={handlePhotoUploaded} />

              {photoPreview && (
                <div className="bg-muted/30 p-2 rounded-md">
                  <div className="flex items-center mb-2">
                    <ImageIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Photo ready to post</p>
                  </div>
                  <div className="aspect-square max-h-64 bg-black rounded-md overflow-hidden">
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Add a caption for your photo... Use @username to mention someone"
                  value={content}
                  onChange={handleContentChange}
                  rows={2}
                  disabled={isSubmitting || !username}
                />

                {showMentionSuggestions && (
                  <div
                    ref={mentionSuggestionsRef}
                    className="absolute z-10 mt-1 w-full max-h-40 overflow-auto bg-background border rounded-md shadow-md"
                  >
                    {mentionSuggestions.map((user) => (
                      <div
                        key={user}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectMention(user)}
                      >
                        @{user}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-0 space-y-4">
              <VideoUploadField onVideoUploaded={handleVideoUploaded} />

              {videoPreview && (
                <div className="bg-muted/30 p-2 rounded-md">
                  <div className="flex items-center mb-2">
                    <FileVideo className="h-4 w-4 mr-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Video ready to post</p>
                  </div>
                  <div className="aspect-video bg-black rounded-md overflow-hidden">
                    <video src={videoPreview} className="w-full h-full object-contain" controls muted playsInline />
                  </div>
                </div>
              )}

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Add a description for your video... Use @username to mention someone"
                  value={content}
                  onChange={handleContentChange}
                  rows={2}
                  disabled={isSubmitting || !username}
                />

                {showMentionSuggestions && (
                  <div
                    ref={mentionSuggestionsRef}
                    className="absolute z-10 mt-1 w-full max-h-40 overflow-auto bg-background border rounded-md shadow-md"
                  >
                    {mentionSuggestions.map((user) => (
                      <div
                        key={user}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectMention(user)}
                      >
                        @{user}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gif" className="mt-0 space-y-4">
              {gifUrl ? (
                <div className="bg-muted/30 p-2 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">GIF ready to post</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setGifUrl("")}>
                      Change GIF
                    </Button>
                  </div>
                  <div className="aspect-square max-h-64 bg-black rounded-md overflow-hidden">
                    <img src={gifUrl || "/placeholder.svg"} alt="GIF" className="w-full h-full object-contain" />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Smile className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">Select a GIF for your post</p>
                  <Button type="button" onClick={() => setShowGifSearch(true)} disabled={!username}>
                    <Smile className="h-4 w-4 mr-2" />
                    Browse GIFs
                  </Button>
                </div>
              )}

              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Add a caption for your GIF... Use @username to mention someone"
                  value={content}
                  onChange={handleContentChange}
                  rows={2}
                  disabled={isSubmitting || !username}
                />

                {showMentionSuggestions && (
                  <div
                    ref={mentionSuggestionsRef}
                    className="absolute z-10 mt-1 w-full max-h-40 overflow-auto bg-background border rounded-md shadow-md"
                  >
                    {mentionSuggestions.map((user) => (
                      <div
                        key={user}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectMention(user)}
                      >
                        @{user}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {postSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>Post created successfully!</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !username ||
                (postType === "video" && !videoUrl) ||
                (postType === "photo" && !photoUrl) ||
                (postType === "gif" && !gifUrl) ||
                (postType === "text" && !content.trim())
              }
              className="w-full"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </form>
        </Tabs>
      </CardContent>

      <Dialog open={showGifSearch} onOpenChange={setShowGifSearch}>
        <DialogContent className="sm:max-w-md p-0 h-[500px]">
          <GifSearch onSelect={handleGifSelected} onClose={() => setShowGifSearch(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
