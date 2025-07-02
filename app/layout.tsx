import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MindReMinder - Your Personal Mindfulness & Reminder App",
  description:
    "Stay mindful, organized, and connected with MindReMinder. Set reminders, practice micro-actions, share inspirational quotes, and connect with friends.",
  keywords: "mindfulness, reminders, productivity, wellness, quotes, micro-actions",
  authors: [{ name: "MindReMinder Team" }],
  openGraph: {
    title: "MindReMinder - Your Personal Mindfulness & Reminder App",
    description: "Stay mindful, organized, and connected with MindReMinder.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
