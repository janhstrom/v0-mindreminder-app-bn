import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>()

  if (error || !profile) {
    // This can happen if the profile trigger failed or was created after the user signed up.
    // For now, we'll redirect, but a better UX would be to prompt them to create a profile.
    console.error("Error fetching profile for settings page:", error)
    redirect("/dashboard?message=Could not load profile.")
  }

  // We need to combine user email with profile data for the form
  const userProfile = {
    ...profile,
    email: user.email!,
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your account and profile settings.</p>
      </div>
      <SettingsForm profile={userProfile} />
    </div>
  )
}
