"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, UserPlus, Check, X } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"

interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: string
  created_at: string
  friend_profile: {
    first_name: string
    last_name: string
    profile_image_url: string | null
  }
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
  createdAt: string
  emailConfirmed: boolean
}

interface FriendsPageClientProps {
  user: User
}

export function FriendsPageClient({ user }: FriendsPageClientProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchEmail, setSearchEmail] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchFriends()
    fetchFriendRequests()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          *,
          friend_profile:profiles!friends_friend_id_fkey(first_name, last_name, profile_image_url)
        `)
        .eq("user_id", user.id)
        .eq("status", "accepted")

      if (error) {
        console.error("Error fetching friends:", error)
        return
      }

      setFriends(data || [])
    } catch (error) {
      console.error("Failed to fetch friends:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          *,
          friend_profile:profiles!friends_user_id_fkey(first_name, last_name, profile_image_url)
        `)
        .eq("friend_id", user.id)
        .eq("status", "pending")

      if (error) {
        console.error("Error fetching friend requests:", error)
        return
      }

      setFriendRequests(data || [])
    } catch (error) {
      console.error("Failed to fetch friend requests:", error)
    }
  }

  const sendFriendRequest = async () => {
    if (!searchEmail.trim()) return

    try {
      // First, find the user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", searchEmail.trim())
        .single()

      if (profileError || !profiles) {
        alert("User not found with that email address")
        return
      }

      // Check if already friends or request exists
      const { data: existingFriend } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${profiles.id}),and(user_id.eq.${profiles.id},friend_id.eq.${user.id})`,
        )
        .single()

      if (existingFriend) {
        alert("Friend request already exists or you are already friends")
        return
      }

      // Send friend request
      const { error } = await supabase.from("friends").insert({
        user_id: user.id,
        friend_id: profiles.id,
        status: "pending",
      })

      if (error) {
        console.error("Error sending friend request:", error)
        alert("Failed to send friend request")
        return
      }

      setSearchEmail("")
      alert("Friend request sent!")
    } catch (error) {
      console.error("Failed to send friend request:", error)
      alert("Failed to send friend request")
    }
  }

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("friends").update({ status: "accepted" }).eq("id", requestId)

      if (error) {
        console.error("Error accepting friend request:", error)
        return
      }

      await fetchFriends()
      await fetchFriendRequests()
    } catch (error) {
      console.error("Failed to accept friend request:", error)
    }
  }

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("friends").delete().eq("id", requestId)

      if (error) {
        console.error("Error rejecting friend request:", error)
        return
      }

      await fetchFriendRequests()
    } catch (error) {
      console.error("Failed to reject friend request:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Header user={user} onLogout={signOut} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
              <p className="text-gray-600 mt-2">Connect with others on your mindfulness journey</p>
            </div>

            {/* Add Friend */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add New Friend</CardTitle>
                <CardDescription>Send a friend request by email address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={sendFriendRequest} disabled={!searchEmail.trim()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Friend Requests</CardTitle>
                  <CardDescription>People who want to connect with you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {friendRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {request.friend_profile?.profile_image_url ? (
                              <img
                                src={request.friend_profile.profile_image_url || "/placeholder.svg"}
                                alt="Profile"
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <Users className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.friend_profile?.first_name} {request.friend_profile?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Sent {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => rejectFriendRequest(request.id)}>
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Friends List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Friends ({friends.length})</CardTitle>
                <CardDescription>People you're connected with</CardDescription>
              </CardHeader>
              <CardContent>
                {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No friends yet</h3>
                    <p className="text-gray-600">Start by sending friend requests to people you know</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {friends.map((friend) => (
                      <div key={friend.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {friend.friend_profile?.profile_image_url ? (
                              <img
                                src={friend.friend_profile.profile_image_url || "/placeholder.svg"}
                                alt="Profile"
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {friend.friend_profile?.first_name} {friend.friend_profile?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Friends since {new Date(friend.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
