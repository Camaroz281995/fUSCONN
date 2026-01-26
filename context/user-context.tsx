"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface UserContextType {
  username: string
  setUsername: (username: string) => void
  profilePhoto: string | null
  setProfilePhoto: (url: string | null) => void
  following: string[]
  addFollowing: (username: string) => void
  removeFollowing: (username: string) => void
  isFollowing: (username: string) => boolean
}

const UserContext = createContext<UserContextType>({
  username: "",
  setUsername: () => {},
  profilePhoto: null,
  setProfilePhoto: () => {},
  following: [],
  addFollowing: () => {},
  removeFollowing: () => {},
  isFollowing: () => false,
})

export const useUser = () => useContext(UserContext)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [username, setUsernameState] = useState("")
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null)
  const [following, setFollowing] = useState<string[]>([])

  // Load user data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username")
      const storedProfilePhoto = localStorage.getItem("profilePhoto")
      const storedFollowing = localStorage.getItem("following")

      if (storedUsername) setUsernameState(storedUsername)
      if (storedProfilePhoto) setProfilePhotoState(storedProfilePhoto)
      if (storedFollowing) {
        try {
          setFollowing(JSON.parse(storedFollowing))
        } catch (error) {
          console.error("Error parsing following list:", error)
        }
      }
    }
  }, [])

  // Save username to localStorage when it changes
  const setUsername = (newUsername: string) => {
    setUsernameState(newUsername)
    localStorage.setItem("username", newUsername)
  }

  // Save profile photo to localStorage when it changes
  const setProfilePhoto = (url: string | null) => {
    setProfilePhotoState(url)
    if (url) {
      localStorage.setItem("profilePhoto", url)
    } else {
      localStorage.removeItem("profilePhoto")
    }
  }

  // Add a user to following list
  const addFollowing = (userToFollow: string) => {
    if (userToFollow === username || following.includes(userToFollow)) return

    const newFollowing = [...following, userToFollow]
    setFollowing(newFollowing)
    localStorage.setItem("following", JSON.stringify(newFollowing))
  }

  // Remove a user from following list
  const removeFollowing = (userToUnfollow: string) => {
    const newFollowing = following.filter((user) => user !== userToUnfollow)
    setFollowing(newFollowing)
    localStorage.setItem("following", JSON.stringify(newFollowing))
  }

  // Check if a user is being followed
  const isFollowing = (user: string) => {
    return following.includes(user)
  }

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        profilePhoto,
        setProfilePhoto,
        following,
        addFollowing,
        removeFollowing,
        isFollowing,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
