"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatPrice, formatDate } from "@/lib/utils"
import { Heart, MessageCircle, ExternalLink, MapPin } from "lucide-react"
import type { MarketplaceListing as ListingType } from "@/lib/types"

interface MarketplaceListingProps {
  listing: ListingType
}

export default function MarketplaceListing({ listing }: MarketplaceListingProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const handleContact = () => {
    // In a real app, this would open a message thread with the seller
    alert(`Contact ${listing.seller} about "${listing.title}"`)
  }

  const handleExternalPayment = () => {
    // In a real app, this would redirect to an external payment processor
    alert("Redirecting to external payment processor...")
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDetails(true)}>
        <CardHeader className="p-0">
          <div className="relative">
            <img
              src={listing.imageUrl || "/placeholder.svg?height=200&width=300&text=No+Image"}
              alt={listing.title}
              className="w-full h-48 object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Image+Error"
              }}
            />
            <Badge className="absolute top-2 right-2" variant="secondary">
              {listing.category}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
            <p className="text-2xl font-bold text-primary">{formatPrice(listing.price, listing.currency)}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{listing.seller.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{listing.seller}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(listing.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{listing.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image */}
            <div className="relative">
              <img
                src={listing.imageUrl || "/placeholder.svg?height=400&width=600&text=No+Image"}
                alt={listing.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=400&width=600&text=Image+Error"
                }}
              />
              <Badge className="absolute top-2 right-2" variant="secondary">
                {listing.category}
              </Badge>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">{formatPrice(listing.price, listing.currency)}</p>
                <p className="text-sm text-muted-foreground">Listed {formatDate(listing.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Contact Seller
                </Button>
                <Button onClick={handleExternalPayment}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>

            {/* Seller Info */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Seller Information</h4>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{listing.seller.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{listing.seller}</p>
                  <p className="text-sm text-muted-foreground">Member since 2023</p>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Location not specified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-medium mb-2">Safety Tips</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Meet in a public place for transactions</li>
                <li>• Inspect items before purchasing</li>
                <li>• Use secure payment methods</li>
                <li>• Report suspicious listings</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
