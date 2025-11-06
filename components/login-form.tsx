"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginFormProps {
  onLogin: (username: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!username.trim() || !password) {
      setError("Username and password are required")
      setLoading(false)
      return
    }

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Authentication failed")
        setLoading(false)
        return
      }

      onLogin(username.trim())
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm" role="alert">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="username" className="block text-sm font-bold mb-2 text-blue-600">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="password" className="block text-sm font-bold mb-2 text-blue-600">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          className="w-full"
        />
      </div>
      {isRegistering && (
        <div>
          <Label htmlFor="confirmPassword" className="block text-sm font-bold mb-2 text-blue-600">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            className="w-full"
          />
        </div>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        {loading ? "Loading..." : isRegistering ? "Join fUSCONN" : "Sign In"}
      </Button>
      <button
        type="button"
        onClick={() => {
          setIsRegistering(!isRegistering)
          setError("")
        }}
        className="w-full text-sm underline text-blue-600 hover:text-purple-600"
      >
        {isRegistering ? "Already have an account?" : "Don't have an account?"}
      </button>
    </form>
  )
}
