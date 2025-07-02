import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/actions"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This should not happen due to middleware, but as a fallback
    return redirect("/login")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-600 mb-4">You are logged in as: {user.email}</p>
        <form action={signOut}>
          <Button type="submit" variant="destructive">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
