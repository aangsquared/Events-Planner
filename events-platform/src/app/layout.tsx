import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./styles/globals.css"
import AuthProvider from "./components/auth/AuthProvider"
import Header from "./components/layout/Header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Events Platform",
  description: "Event management platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          <main className="[&:not(:has([data-auth-page]))]:pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
