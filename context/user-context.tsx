"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { persistentStorage } from "@/lib/persistent-storage"
import type { User } from "@/lib/types"

interface UserContextType {
  user: User | null
  username: string | null
  profilePhoto: string | null
  login: (username: string, password: string) => boolean
  register: (username: string, email: string, password: string) => boolean
  logout: () => void
  setProfilePhoto: (photo: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("fuscon_current_user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)

      // Load profile photo
      const photo = persistentStorage.getProfilePhoto(userData.username)
      setProfilePhotoState(photo)
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    const users = persistentStorage.getUsers()
    const foundUser = users.find((u) => u.username === username)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("fuscon_current_user", JSON.stringify(foundUser))

      // Load profile photo
      const photo = persistentStorage.getProfilePhoto(username)
      setProfilePhotoState(photo)

      return true
    }
    return false
  }

  const register = (username: string, email: string, password: string): boolean => {
    const users = persistentStorage.getUsers()
    const existingUser = users.find((u) => u.username === username || u.email === email)

    if (existingUser) {
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      createdAt: Date.now(),
    }

    persistentStorage.saveUser(newUser)
    setUser(newUser)
    localStorage.setItem("fuscon_current_user", JSON.stringify(newUser))

    return true
  }

  const logout = () => {
    setUser(null)
    setProfilePhotoState(null)
    localStorage.removeItem("fuscon_current_user")
  }

  const setProfilePhoto = (photo: string) => {
    setProfilePhotoState(photo)
    if (user) {
      persistentStorage.setProfilePhoto(user.username, photo)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        username: user?.username || null,
        profilePhoto,
        login,
        register,
        logout,
        setProfilePhoto,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
