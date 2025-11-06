"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ImageIcon, Upload, X, Camera, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PhotoUploadFieldProps {
  onPhotoUploaded: (url: string) => void
}

export default function PhotoUploadField({ onPhotoUploaded }: PhotoUploadFieldProps) {
  const { username } = useUser()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAbortController = useRef<AbortController | null>(null)

  // Set max file size to 3MB
  const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File is too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB). Please select a smaller image.`)
      return
    }

    setFile(selectedFile)
    setError("")

    // Create preview for image
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    // Close dialog if open
    setShowUploadDialog(false)
  }, [])

  const handleUpload = async () => {
    if (!file || !username) return

    try {
      setUploading(true)
      setProgress(0)
      setError("")

      // Double-check file size before upload
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File is too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB). Please select a smaller image.`)
      }

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("username", username)

      // Create an abort controller for the fetch request
      uploadAbortController.current = new AbortController()

      // Use fetch with progress tracking
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            setProgress(100)
            onPhotoUploaded(response.url)
          } catch (error) {
            setError("Error processing server response")
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            throw new Error(errorData.error || `Upload failed with status: ${xhr.status}`)
          } catch (e) {
            if (xhr.status === 413) {
              throw new Error(
                `File is too large for the server. Please select a smaller image (max ${MAX_FILE_SIZE / (1024 * 1024)}MB).`,
              )
            } else {
              throw new Error(`Upload failed with status: ${xhr.status}`)
            }
          }
        }
      }

      xhr.onerror = () => {
        throw new Error("Network error occurred during upload")
      }

      xhr.onabort = () => {
        setError("Upload was cancelled")
      }

      xhr.open("POST", "/api/photos/upload", true)
      xhr.send(formData)

      // Store the XHR object for potential abort
      uploadAbortController.current = {
        abort: () => xhr.abort(),
      } as AbortController
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
      setUploading(false)
      setProgress(0)
    }
  }

  const cancelUpload = () => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort()
      uploadAbortController.current = null
    }
    setUploading(false)
    setProgress(0)
  }

  const handleClear = () => {
    if (uploading) {
      cancelUpload()
    }

    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setProgress(0)
    setError("")
  }

  const openFilePicker = (captureMethod?: string) => {
    if (fileInputRef.current) {
      // Set capture attribute if specified
      if (captureMethod) {
        fileInputRef.current.setAttribute("capture", captureMethod)
      } else {
        fileInputRef.current.removeAttribute("capture")
      }
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">Upload a photo from your device</p>
          <p className="text-xs text-muted-foreground mb-4 font-bold">
            Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
          </p>

          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={!username}
            className="hidden"
            id="photo-upload"
            ref={fileInputRef}
          />

          <Button
            type="button"
            variant="outline"
            disabled={!username}
            className="w-full mb-2"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>

          {!username && <p className="text-xs text-amber-500 mt-2">Set your username in the Profile tab first</p>}
        </div>
      ) : (
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={uploading && progress > 0 && progress < 100}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mb-2">
            <span className={file.size > MAX_FILE_SIZE ? "text-red-500 font-bold" : ""}>
              {(file.size / (1024 * 1024)).toFixed(2)}MB
            </span>{" "}
            / {MAX_FILE_SIZE / (1024 * 1024)}MB
            {file.size > MAX_FILE_SIZE && (
              <p className="text-red-500 mt-1">File exceeds the maximum size limit. Please select a smaller image.</p>
            )}
          </div>

          {previewUrl && (
            <div className="mb-3 relative aspect-square max-h-64 bg-black rounded-md overflow-hidden">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="mb-2">Uploading... {progress}%</div>
                    <div className="w-32 mx-auto">
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!uploading && progress === 0 && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || file.size > MAX_FILE_SIZE}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Photo
            </Button>
          )}

          {uploading && progress < 100 && (
            <Button type="button" variant="destructive" onClick={cancelUpload} className="w-full">
              Cancel Upload
            </Button>
          )}

          {progress === 100 && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription className="text-sm">Photo uploaded successfully!</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Options Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>
              Choose a photo from your gallery or take a new one
              <span className="block text-xs mt-1 text-muted-foreground font-bold">
                Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 p-2"
              onClick={() => openFilePicker()}
            >
              <ImageIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Photo Gallery</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 p-2"
              onClick={() => openFilePicker("user")}
            >
              <Camera className="h-8 w-8 mb-2" />
              <span className="text-sm">Take Photo</span>
            </Button>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
