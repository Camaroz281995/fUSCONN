"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/context/user-context"
import { Wifi, Users, MessageCircle, Heart } from "lucide-react"

export default function AuthPage() {
  const { login, register } = useUser()
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!loginForm.username || !loginForm.password) {
      setError("Please fill in all fields")
      return
    }

    const success = login(loginForm.username, loginForm.password)
    if (!success) {
      setError("Invalid username or password")
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setError("Please fill in all fields")
      return
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    const success = register(registerForm.username, registerForm.email, registerForm.password)
    if (!success) {
      setError("Username or email already exists")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <img src="/images/fuscon-logo.png" alt="Fuscon" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fuscon
          </h1>
          <p className="text-muted-foreground mt-2">Connect, Share, Explore with P2P Technology</p>
        </div>

        {/* Features Preview */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <Wifi className="h-8 w-8 mx-auto text-blue-500" />
                <p className="text-sm font-medium">P2P Network</p>
                <p className="text-xs text-muted-foreground">Decentralized connection</p>
              </div>
              <div className="space-y-2">
                <Users className="h-8 w-8 mx-auto text-green-500" />
                <p className="text-sm font-medium">Communities</p>
                <p className="text-xs text-muted-foreground">Join groups</p>
              </div>
              <div className="space-y-2">
                <MessageCircle className="h-8 w-8 mx-auto text-purple-500" />
                <p className="text-sm font-medium">Messaging</p>
                <p className="text-xs text-muted-foreground">Direct chat</p>
              </div>
              <div className="space-y-2">
                <Heart className="h-8 w-8 mx-auto text-pink-500" />
                <p className="text-sm font-medium">Virtual Pets</p>
                <p className="text-xs text-muted-foreground">Care for pets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth Forms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Join the Network</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full">
                    Connect to Network
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full">
                    Join Network
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By joining, you agree to connect to our peer-to-peer network
        </p>
      </div>
    </div>
  )
}
