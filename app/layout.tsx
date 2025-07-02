import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MindReMinder - Your Personal Mindfulness & Reminder App",
  description:
    "Stay mindful, organized, and connected with MindReMinder. Get personalized reminders, inspirational quotes, and micro-actions to improve your daily life.",
  keywords: "mindfulness, reminders, productivity, quotes, micro-actions, wellness",
  authors: [{ name: "MindReMinder Team" }],
  openGraph: {
    title: "MindReMinder - Your Personal Mindfulness & Reminder App",
    description: "Stay mindful, organized, and connected with MindReMinder.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindReMinder - Your Personal Mindfulness & Reminder App",
    description: "Stay mindful, organized, and connected with MindReMinder.",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
