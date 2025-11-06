"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X, UserCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ProfilePhotoUpload() {
  const { username, profilePhoto, setProfilePhoto } = useUser()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (selectedFile.size > maxSize) {
      setError("File is too large (max 5MB)")
      return
    }

    setFile(selectedFile)
    setError("")

    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  const handleUpload = async () => {
    if (!file || !username) return

    try {
      setUploading(true)
      setProgress(0)
      setError("")

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("username", username)

      // Simulate progress for demo purposes
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Upload to server
      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload photo")
      }

      const data = await response.json()

      // Clear the interval and set progress to 100%
      clearInterval(interval)
      setProgress(100)

      // Update profile photo in context
      setProfilePhoto(data.url)

      // Reset after a short delay
      setTimeout(() => {
        setProgress(0)
        setFile(null)
        setPreviewUrl(null)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreviewUrl(null)
    setProgress(0)
    setError("")
  }

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 cursor-pointer" onClick={openFilePicker}>
        {previewUrl ? (
          <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Preview" />
        ) : profilePhoto ? (
          <AvatarImage src={profilePhoto || "/placeholder.svg"} alt={username} />
        ) : (
          <AvatarFallback className="text-2xl">
            {username ? username.substring(0, 2).toUpperCase() : <UserCircle className="h-12 w-12" />}
          </AvatarFallback>
        )}
      </Avatar>

      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={openFilePicker} disabled={uploading}>
          <Camera className="h-4 w-4 mr-1" />
          Change Photo
        </Button>

        {previewUrl && (
          <Button size="sm" variant="outline" onClick={handleClear} disabled={uploading}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {previewUrl && (
        <div className="w-full max-w-xs">
          {progress > 0 && <Progress value={progress} className="h-2 mb-2" />}

          <Button onClick={handleUpload} disabled={uploading || !file} className="w-full" size="sm">
            {uploading ? (
              <span>Uploading... {progress}%</span>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                Save Photo
              </>
            )}
          </Button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
