"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ShoppingBag, Search, Plus, DollarSign, Package, Tag, MapPin, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CATEGORIES = ["Electronics", "Fashion", "Home", "Books", "Sports", "Vehicles", "Other"]

interface MarketplaceListing {
  id: string
  title: string
  description: string
  price: number
  category: string
  location: string
  imageUrl: string
  sellerUsername: string
  timestamp: number
  contactEmail: string | null
  contactPhone: string | null
  status: string
}

interface MarketplaceTabProps {
  username: string
}

export default function MarketplaceTab({ username }: MarketplaceTabProps) {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newLocation, setNewLocation] = useState("")

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = () => {
    try {
      const stored = localStorage.getItem("fusconn-global-marketplace")
      if (stored) {
        setListings(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading listings:", error)
    }
  }

  const saveListings = (updatedListings: MarketplaceListing[]) => {
    localStorage.setItem("fusconn-global-marketplace", JSON.stringify(updatedListings))
    setListings(updatedListings)
  }

  const handleCreateListing = () => {
    if (!username) {
      alert("Please sign in to create listings")
      return
    }

    if (!newTitle.trim() || !newPrice || !newCategory) {
      alert("Please fill in all required fields")
      return
    }

    const newListing: MarketplaceListing = {
      id: `listing-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      price: Number.parseFloat(newPrice),
      category: newCategory,
      location: newLocation.trim(),
      imageUrl: "",
      sellerUsername: username,
      timestamp: Date.now(),
      contactEmail: null,
      contactPhone: null,
      status: "active",
    }

    const updatedListings = [newListing, ...listings]
    saveListings(updatedListings)

    setNewTitle("")
    setNewDescription("")
    setNewPrice("")
    setNewCategory("")
    setNewLocation("")
    setShowCreateDialog(false)
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory

    return matchesSearch && matchesCategory && listing.status === "active"
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Marketplace
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Sell Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Listing</DialogTitle>
                </DialogHeader>
                {!username ? (
                  <div className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-4">Please sign in to sell items</p>
                    <Button onClick={() => setShowCreateDialog(false)}>Close</Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="What are you selling?"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your item..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newCategory} onValueChange={setNewCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateListing}>Create Listing</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search marketplace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Badge>
            {CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredListings.length === 0 ? (
        <Card className="bg-white shadow-md">
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try a different search term" : "Be the first to list an item!"}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 flex items-center justify-center rounded-t-lg">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg line-clamp-1">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{listing.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {listing.category}
                  </Badge>
                  {listing.location && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {listing.location}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {listing.sellerUsername.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">@{listing.sellerUsername}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{formatPrice(listing.price)}</p>
                  </div>
                </div>

                <Button className="w-full mt-3">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
