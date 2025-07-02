"use client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { RemindersPageClient } from "@/components/dashboard/reminders-page-client"

interface Reminder {
  id: string
  title: string
  description: string
  reminder_time: string
  is_recurring: boolean
  recurrence_pattern: string | null
  is_completed: boolean
  created_at: string
}

export default async function RemindersPage() {
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

  return <RemindersPageClient user={userData} />
}
