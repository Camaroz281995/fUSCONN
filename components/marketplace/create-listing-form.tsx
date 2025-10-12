"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { persistentStorage } from "@/lib/persistent-storage"
import { generateId } from "@/lib/utils"
import type { MarketplaceListing } from "@/lib/types"
import { Upload, X } from "lucide-react"

interface CreateListingFormProps {
  onSuccess: () => void
}

export default function CreateListingForm({ onSuccess }: CreateListingFormProps) {
  const { username } = useUser()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState<"new" | "used" | "refurbished">("used")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ["electronics", "clothing", "books", "home", "sports", "other"]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImages((prev) => [...prev, result])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !title.trim() || !description.trim() || !price || !category) return

    setIsSubmitting(true)

    try {
      const listings = persistentStorage.getMarketplaceListings()

      const newListing: MarketplaceListing = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        price: Number.parseFloat(price),
        seller: username,
        images,
        category,
        condition,
        createdAt: Date.now(),
        sold: false,
      }

      listings.unshift(newListing)
      persistentStorage.saveMarketplaceListings(listings)

      onSuccess()
    } catch (error) {
      console.error("Error creating listing:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="What are you selling?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your item..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select value={condition} onValueChange={(value: "new" | "used" | "refurbished") => setCondition(value)}>
            <SelectTrigger id="condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="refurbished">Refurbished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <Label htmlFor="image-upload" className="cursor-pointer">
            <Button type="button" variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </span>
            </Button>
          </Label>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Creating..." : "Create Listing"}
        </Button>
      </div>
    </form>
  )
}
