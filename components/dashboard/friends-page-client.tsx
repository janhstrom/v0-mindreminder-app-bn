"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Users } from "lucide-react"

interface Props {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    profileImage: string | null
    createdAt: string
    emailConfirmed: boolean
  }
}

interface FriendRow {
  id: string
  friend_id: string
  status: "accepted" | "pending"
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string
    profile_image_url: string | null
  }
}

export function FriendsPageClient({ user }: Props) {
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("friends")
        .select(
          "id, friend_id, status, created_at, profiles:profiles!friends_friend_id_fkey (first_name, last_name, email, profile_image_url)",
        )
        .eq("user_id", user.id)

      if (error) console.error(error)
      setFriends(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase, user.id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Friends</h1>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>

            {friends.length === 0 ? (
              <Card>
                <CardContent className="p-8 flex flex-col items-center gap-4 text-gray-600">
                  <Users className="h-10 w-10" />
                  You don’t have any friends yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {friends.map((f) => (
                  <Card key={f.id}>
                    <CardContent className="p-6 space-y-1">
                      <p className="font-medium">
                        {f.profiles.first_name
                          ? `${f.profiles.first_name} ${f.profiles.last_name ?? ""}`
                          : f.profiles.email}
                      </p>
                      <span className="text-sm text-gray-500">{f.status}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
