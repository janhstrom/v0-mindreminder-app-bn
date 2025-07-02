import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClientContent } from "@/components/dashboard/dashboard-client-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const userData = {
    id: user.id,
    email: user.email ?? "",
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    profileImage: profile?.profile_image_url ?? null,
    createdAt: user.created_at,
    emailConfirmed: !!user.email_confirmed_at,
  }

  return <DashboardClientContent user={userData} />
}
