"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, X, ImageIcon, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export default function BackgroundPhotoUpload() {
  const { username, backgroundPhoto, setBackgroundPhoto } = useUser()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Optimized file change handler with useCallback
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create preview URL and immediately apply it as a temporary background
      // This gives the user immediate feedback
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreviewUrl(objectUrl)

      // Apply the background immediately for instant feedback
      // We'll replace this with the actual data URL after upload
      setBackgroundPhoto(objectUrl)

      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl)
    },
    [setBackgroundPhoto],
  )

  // Optimized upload handler
  const handleUpload = useCallback(async () => {
    if (!file || !username) return

    try {
      setUploading(true)
      setProgress(0)
      setError("")
      setSuccess(false)

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("username", username)

      // Create a data URL immediately for faster display
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (dataUrl) {
          // Update the background immediately with the data URL
          setBackgroundPhoto(dataUrl)
        }
      }
      reader.readAsDataURL(file)

      // Simulate fast progress for better UX
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 15 // Faster progress increments
        })
      }, 50) // Shorter interval

      // Upload to server
      const response = await fetch("/api/profile/background", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload background photo")
      }

      const data = await response.json()

      // Clear the interval and set progress to 100%
      clearInterval(interval)
      setProgress(100)

      // Update background photo in context with the server response
      console.log("Setting background photo from upload:", data.url)
      setBackgroundPhoto(data.url)
      setSuccess(true)

      // Reset after a short delay
      setTimeout(() => {
        setProgress(0)
        setFile(null)
        setPreviewUrl(null)
        setSuccess(false)
      }, 1500) // Shorter success message display
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
      // Revert to previous background if there was an error
      if (backgroundPhoto) {
        setBackgroundPhoto(backgroundPhoto)
      }
    } finally {
      setUploading(false)
    }
  }, [file, username, setBackgroundPhoto, backgroundPhoto])

  const handleClear = useCallback(() => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setProgress(0)
    setError("")
    setSuccess(false)
  }, [previewUrl])

  const openFilePicker = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
        {backgroundPhoto || previewUrl ? (
          <img
            src={previewUrl || backgroundPhoto || "/placeholder.svg"}
            alt="Background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="sm" onClick={openFilePicker}>
            <Camera className="h-4 w-4 mr-1" />
            Change Background
          </Button>
        </div>
      </div>

      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />

      {file && (
        <div className="w-full">
          {progress > 0 && (
            <div className="mb-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center mt-1 text-muted-foreground">
                {progress < 100 ? `Uploading... ${progress}%` : "Processing..."}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={cn("flex-1", success && "bg-green-600 hover:bg-green-700")}
              size="sm"
            >
              {uploading ? (
                <span>Uploading...</span>
              ) : success ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Apply Background
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={handleClear} disabled={uploading}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>Background updated successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
