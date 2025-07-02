"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus, MessageCircle, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface HeaderUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string | null
  createdAt: string
  emailConfirmed: boolean
}

interface Friend {
  id: string
  friend_id: string
  status: string
  created_at: string
  friend_profile: {
    first_name: string
    last_name: string
    profile_image_url?: string
    email: string
  }
}

interface FriendsPageClientProps {
  user: HeaderUser
}

export function FriendsPageClient({ user }: FriendsPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
  }, [])

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          *,
          friend_profile:profiles!friends_friend_id_fkey(
            first_name,
            last_name,
            profile_image_url,
            email
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "accepted")

      if (error) throw error
      setFriends(data || [])
    } catch (error) {
      console.error("Error fetching friends:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          *,
          friend_profile:profiles!friends_user_id_fkey(
            first_name,
            last_name,
            profile_image_url,
            email
          )
        `)
        .eq("friend_id", user.id)
        .eq("status", "pending")

      if (error) throw error
      setPendingRequests(data || [])
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const sendFriendRequest = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }

    try {
      // First, find the user by email
      const { data: targetUser, error: userError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", searchEmail.trim())
        .single()

      if (userError || !targetUser) {
        toast.error("User not found")
        return
      }

      if (targetUser.id === user.id) {
        toast.error("You cannot add yourself as a friend")
        return
      }

      // Check if friendship already exists
      const { data: existingFriend } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${targetUser.id}),and(user_id.eq.${targetUser.id},friend_id.eq.${user.id})`,
        )
        .single()

      if (existingFriend) {
        toast.error("Friend request already exists or you are already friends")
        return
      }

      // Send friend request
      const { error } = await supabase.from("friends").insert({
        user_id: user.id,
        friend_id: targetUser.id,
        status: "pending",
      })

      if (error) throw error

      toast.success("Friend request sent!")
      setSearchEmail("")
    } catch (error) {
      console.error("Error sending friend request:", error)
      toast.error("Failed to send friend request")
    }
  }

  const acceptFriendRequest = async (requestId: string, friendId: string) => {
    try {
      // Update the request status
      const { error: updateError } = await supabase.from("friends").update({ status: "accepted" }).eq("id", requestId)

      if (updateError) throw updateError

      // Create the reciprocal friendship
      const { error: insertError } = await supabase.from("friends").insert({
        user_id: user.id,
        friend_id: friendId,
        status: "accepted",
      })

      if (insertError) throw insertError

      toast.success("Friend request accepted!")
      fetchFriends()
      fetchPendingRequests()
    } catch (error) {
      console.error("Error accepting friend request:", error)
      toast.error("Failed to accept friend request")
    }
  }

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("friends").delete().eq("id", requestId)

      if (error) throw error

      toast.success("Friend request rejected")
      fetchPendingRequests()
    } catch (error) {
      console.error("Error rejecting friend request:", error)
      toast.error("Failed to reject friend request")
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
              <p className="text-gray-600 mt-1">Connect with friends and share your progress</p>
            </div>

            {/* Add Friend Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Friend
                </CardTitle>
                <CardDescription>Send a friend request by email address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter email address"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendFriendRequest()}
                  />
                  <Button onClick={sendFriendRequest}>
                    <Search className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Pending Friend Requests</CardTitle>
                  <CardDescription>People who want to connect with you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={request.friend_profile?.profile_image_url || ""} />
                            <AvatarFallback>
                              {getInitials(
                                request.friend_profile?.first_name || "",
                                request.friend_profile?.last_name || "",
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {request.friend_profile?.first_name} {request.friend_profile?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{request.friend_profile?.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => acceptFriendRequest(request.id, request.user_id)}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => rejectFriendRequest(request.id)}>
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
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Your Friends ({friends.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading friends...</div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No friends yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add friends to share your progress and stay motivated together
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar>
                            <AvatarImage src={friend.friend_profile?.profile_image_url || ""} />
                            <AvatarFallback>
                              {getInitials(
                                friend.friend_profile?.first_name || "",
                                friend.friend_profile?.last_name || "",
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {friend.friend_profile?.first_name} {friend.friend_profile?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{friend.friend_profile?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Connected</Badge>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
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
