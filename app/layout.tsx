"use client"
import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { usePaymentNotifications } from "@/hooks/use-payment-notifications" // <-- Add this import

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Worldpay Text-to-Pay Demo",
  description: "A demonstration of Worldpay's text-to-pay API capabilities",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  usePaymentNotifications()

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
