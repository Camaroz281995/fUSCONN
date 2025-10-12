"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { persistentStorage } from "@/lib/persistent-storage"
import { formatDate } from "@/lib/utils"
import { Mail, Phone, UserPlus, Bell, Check, X, Video } from "lucide-react"
import type { Notification, FriendRequest } from "@/lib/types"

export default function FusionaryMailbox() {
  const { username } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])

  useEffect(() => {
    if (username) {
      loadNotifications()
      loadFriendRequests()
    }
  }, [username])

  const loadNotifications = () => {
    if (!username) return
    const userNotifications = persistentStorage.getUserNotifications(username)
    setNotifications(userNotifications)
  }

  const loadFriendRequests = () => {
    if (!username) return
    const allRequests = persistentStorage.getFriendRequests()
    const pendingRequests = allRequests.filter(
      (request) => request.toUsername === username && request.status === "pending",
    )
    setFriendRequests(pendingRequests)
  }

  const markNotificationAsRead = (notificationId: string) => {
    persistentStorage.markNotificationAsRead(notificationId)
    loadNotifications()
  }

  const handleFriendRequest = (requestId: string, action: "accepted" | "declined") => {
    persistentStorage.updateFriendRequestStatus(requestId, action)
    loadFriendRequests()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "message":
        return <Mail className="h-4 w-4" />
      case "friend_request":
        return <UserPlus className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  if (!username) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Sign in to view mailbox</h3>
        <p className="text-muted-foreground">Your notifications and messages will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Fusionary Mailbox</h3>
        <div className="flex gap-2">
          {unreadNotifications.length > 0 && <Badge variant="destructive">{unreadNotifications.length} unread</Badge>}
          {friendRequests.length > 0 && <Badge variant="secondary">{friendRequests.length} requests</Badge>}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="friend-requests" className="relative">
            Friend Requests
            {friendRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {friendRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-2">
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Unread notifications */}
                {unreadNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{notification.fromUsername.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <span className="font-medium">{notification.fromUsername}</span>
                            {notification.callType && (
                              <Badge variant="outline" className="text-xs">
                                {notification.callType === "video" ? (
                                  <Video className="h-3 w-3 mr-1" />
                                ) : (
                                  <Phone className="h-3 w-3 mr-1" />
                                )}
                                {notification.callType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{notification.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.timestamp)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => markNotificationAsRead(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Read notifications */}
                {readNotifications.map((notification) => (
                  <Card key={notification.id} className="p-3 opacity-60">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{notification.fromUsername.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <span className="font-medium">{notification.fromUsername}</span>
                          {notification.callType && (
                            <Badge variant="outline" className="text-xs">
                              {notification.callType === "video" ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <Phone className="h-3 w-3 mr-1" />
                              )}
                              {notification.callType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{notification.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.timestamp)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="friend-requests" className="space-y-2">
          <ScrollArea className="h-[400px]">
            {friendRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No friend requests</h3>
                <p className="text-muted-foreground">New friend requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friendRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{request.fromUsername.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.fromUsername}</p>
                          <p className="text-sm text-muted-foreground">wants to be your friend</p>
                          <p className="text-xs text-muted-foreground">{formatDate(request.timestamp)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleFriendRequest(request.id, "declined")}>
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                        <Button size="sm" onClick={() => handleFriendRequest(request.id, "accepted")}>
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
