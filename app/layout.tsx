import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { UserProvider } from "@/context/user-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fuscon",
  description: "Connect, Share, Explore with P2P Technology",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
