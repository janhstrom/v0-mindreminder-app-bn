import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings/settings-form"
import type { Profile } from "@/types"

export default async function SettingsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Error fetching profile:", error)
    // Handle case where profile doesn't exist yet, maybe redirect to a profile setup page
    // For now, we'll just show an error or a default state in the form.
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="grid w-full max-w-6xl items-start gap-6">
        <SettingsForm profile={profile as Profile} />
      </div>
    </main>
  )
}
