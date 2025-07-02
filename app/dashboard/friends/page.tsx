import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FriendsPageClient } from "@/components/dashboard/friends-page-client"

export default async function FriendsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

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

  return <FriendsPageClient user={userData} />
}
