"use client"
import { AnalyticsPageClient } from "@/components/dashboard/analytics-page-client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"

interface AnalyticsData {
  totalReminders: number
  completedReminders: number
  totalMicroActions: number
  completedMicroActions: number
  currentStreak: number
  weeklyCompletion: number
  monthlyStats: {
    week: string
    completed: number
    total: number
  }[]
}

export default async function AnalyticsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, profile_image_url")
    .eq("id", user.id)
    .single()

  const userData = {
    id: user.id,
    email: user.email || "",
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    profileImage: profile?.profile_image_url || null,
    createdAt: user.created_at,
    emailConfirmed: !!user.email_confirmed_at,
  }

  return <AnalyticsPageClient user={userData} />
}

// AnalyticsPageClient component should be defined in "@/components/dashboard/analytics-page-client"
