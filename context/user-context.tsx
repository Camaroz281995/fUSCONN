"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface UserContextType {
  username: string
  setUsername: (username: string) => void
  password: string | null
  setPassword: (password: string | null) => void
  isAuthenticated: boolean
  profilePhoto: string | null
  setProfilePhoto: (url: string | null) => void
  backgroundPhoto: string | null
  setBackgroundPhoto: (url: string | null) => void
  customMusic: string | null
  setCustomMusic: (url: string | null) => void
  following: string[]
  addFollowing: (username: string) => void
  removeFollowing: (username: string) => void
  isFollowing: (username: string) => boolean
}

const UserContext = createContext<UserContextType>({
  username: "",
  setUsername: () => {},
  password: null,
  setPassword: () => {},
  isAuthenticated: false,
  profilePhoto: null,
  setProfilePhoto: () => {},
  backgroundPhoto: null,
  setBackgroundPhoto: () => {},
  customMusic: null,
  setCustomMusic: () => {},
  following: [],
  addFollowing: () => {},
  removeFollowing: () => {},
  isFollowing: () => false,
})

export const useUser = () => useContext(UserContext)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [backgroundPhoto, setBackgroundPhoto] = useState<string | null>(null)
  const [customMusic, setCustomMusic] = useState<string | null>(null)
  const [following, setFollowing] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load user data from localStorage on client side
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === "undefined") return

    try {
      const storedUsername = localStorage.getItem("fusionConnectUsername")
      const storedPassword = localStorage.getItem("fusionConnectPassword")
      const storedProfilePhoto = localStorage.getItem("fusionConnectProfilePhoto")
      const storedBackgroundPhoto = localStorage.getItem("fusionConnectBackgroundPhoto")
      const storedCustomMusic = localStorage.getItem("fusionConnectCustomMusic")
      const storedFollowing = localStorage.getItem("fusionConnectFollowing")

      if (storedUsername) {
        setUsername(storedUsername)
      }

      if (storedPassword) {
        setPassword(storedPassword)
        setIsAuthenticated(true)
      }

      if (storedProfilePhoto) {
        setProfilePhoto(storedProfilePhoto)
      }

      if (storedBackgroundPhoto) {
        setBackgroundPhoto(storedBackgroundPhoto)
      }

      if (storedCustomMusic) {
        setCustomMusic(storedCustomMusic)
      }

      if (storedFollowing) {
        try {
          setFollowing(JSON.parse(storedFollowing))
        } catch (error) {
          console.error("Error parsing following data:", error)
          setFollowing([])
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const handleSetUsername = useCallback(
    (newUsername: string) => {
      setUsername(newUsername)
      localStorage.setItem("fusionConnectUsername", newUsername)

      // Save user profile to localStorage
      if (password) {
        const users = JSON.parse(localStorage.getItem("fusionConnectUsers") || "{}")
        users[newUsername] = {
          username: newUsername,
          password,
          followers: users[newUsername]?.followers || [],
          following,
        }
        localStorage.setItem("fusionConnectUsers", JSON.stringify(users))
      }
    },
    [password, following],
  )

  const handleSetPassword = useCallback(
    (newPassword: string | null) => {
      setPassword(newPassword)

      if (newPassword) {
        localStorage.setItem("fusionConnectPassword", newPassword)
        setIsAuthenticated(true)

        // Save user profile with password
        if (username) {
          const users = JSON.parse(localStorage.getItem("fusionConnectUsers") || "{}")
          users[username] = {
            username,
            password: newPassword,
            followers: users[username]?.followers || [],
            following,
          }
          localStorage.setItem("fusionConnectUsers", JSON.stringify(users))
        }
      } else {
        localStorage.removeItem("fusionConnectPassword")
        setIsAuthenticated(false)
      }
    },
    [username, following],
  )

  const handleSetProfilePhoto = useCallback((url: string | null) => {
    setProfilePhoto(url)
    if (url) {
      localStorage.setItem("fusionConnectProfilePhoto", url)
    } else {
      localStorage.removeItem("fusionConnectProfilePhoto")
    }
  }, [])

  const handleSetBackgroundPhoto = useCallback((url: string | null) => {
    setBackgroundPhoto(url)
    if (url) {
      localStorage.setItem("fusionConnectBackgroundPhoto", url)
    } else {
      localStorage.removeItem("fusionConnectBackgroundPhoto")
    }
  }, [])

  const handleSetCustomMusic = useCallback((url: string | null) => {
    setCustomMusic(url)
    if (url) {
      localStorage.setItem("fusionConnectCustomMusic", url)
    } else {
      localStorage.removeItem("fusionConnectCustomMusic")
    }
  }, [])

  const addFollowing = useCallback(
    (userToFollow: string) => {
      if (userToFollow === username || following.includes(userToFollow)) return

      const newFollowing = [...following, userToFollow]
      setFollowing(newFollowing)
      localStorage.setItem("fusionConnectFollowing", JSON.stringify(newFollowing))
    },
    [username, following],
  )

  const removeFollowing = useCallback(
    (userToUnfollow: string) => {
      const newFollowing = following.filter((user) => user !== userToUnfollow)
      setFollowing(newFollowing)
      localStorage.setItem("fusionConnectFollowing", JSON.stringify(newFollowing))
    },
    [following],
  )

  const isFollowing = useCallback(
    (user: string) => {
      return following.includes(user)
    },
    [following],
  )

  // Don't render children until we've initialized from localStorage
  // This prevents hydration mismatches
  if (!isInitialized && typeof window !== "undefined") {
    return null
  }

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername: handleSetUsername,
        password,
        setPassword: handleSetPassword,
        isAuthenticated,
        profilePhoto,
        setProfilePhoto: handleSetProfilePhoto,
        backgroundPhoto,
        setBackgroundPhoto: handleSetBackgroundPhoto,
        customMusic,
        setCustomMusic: handleSetCustomMusic,
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
