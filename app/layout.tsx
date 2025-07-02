import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MindReMinder - Your Personal Mindfulness & Reminder App",
  description:
    "Stay mindful, organized, and motivated with personalized reminders, micro-actions, and daily inspiration.",
  keywords: "mindfulness, reminders, productivity, wellness, motivation, micro-actions",
  authors: [{ name: "MindReMinder Team" }],
  creator: "MindReMinder",
  publisher: "MindReMinder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://mindreminder.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MindReMinder - Your Personal Mindfulness & Reminder App",
    description:
      "Stay mindful, organized, and motivated with personalized reminders, micro-actions, and daily inspiration.",
    url: "https://mindreminder.vercel.app",
    siteName: "MindReMinder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindReMinder - Your Personal Mindfulness & Reminder App",
    description:
      "Stay mindful, organized, and motivated with personalized reminders, micro-actions, and daily inspiration.",
    creator: "@mindreminder",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
