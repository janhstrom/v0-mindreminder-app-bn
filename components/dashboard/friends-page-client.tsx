"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, Check, X, Mail, Search, Heart } from "lucide-react"
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
    email: string
    profile_image_url: string | null
  }
}

interface FriendRequest {
  id: string
  user_id: string
  friend_id: string
  status: string
  created_at: string
  sender_profile: {
    first_name: string
    last_name: string
    email: string
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
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("friends")
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
          friend_profile:profiles!friends_friend_id_fkey(first_name, last_name, email, profile_image_url)
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
          sender_profile:profiles!friends_user_id_fkey(first_name, last_name, email, profile_image_url)
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

  const searchUsers = async () => {
    if (!searchEmail.trim()) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, profile_image_url")
        .ilike("email", `%${searchEmail.trim()}%`)
        .neq("id", user.id)
        .limit(5)

      if (error) {
        console.error("Error searching users:", error)
        return
      }

      setSearchResults(data || [])
    } catch (error) {
      console.error("Failed to search users:", error)
    }
  }

  const sendFriendRequest = async (friendEmail: string) => {
    try {
      // First, find the user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", friendEmail.trim())
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
      setSearchResults([])
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

  const removeFriend = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

      if (error) {
        console.error("Error removing friend:", error)
        return
      }

      await fetchFriends()
    } catch (error) {
      console.error("Failed to remove friend:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
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
        <Header user={user} onLogout={handleLogout} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
                  <p className="text-gray-600 mt-2">Connect with others on your mindfulness journey</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {friends.length} Friends
                  </Badge>
                  {friendRequests.length > 0 && (
                    <Badge variant="destructive">
                      <Mail className="h-3 w-3 mr-1" />
                      {friendRequests.length} Requests
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
                <TabsTrigger value="requests">Requests ({friendRequests.length})</TabsTrigger>
                <TabsTrigger value="add">Add Friends</TabsTrigger>
              </TabsList>

              <TabsContent value="friends" className="space-y-4">
                {friends.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start connecting with friends to share meaningful reminders
                        </p>
                        <Button onClick={() => setActiveTab("add")}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friends
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <Card key={friend.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={friend.friend_profile?.profile_image_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {friend.friend_profile?.first_name?.[0]}
                                {friend.friend_profile?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {friend.friend_profile?.first_name} {friend.friend_profile?.last_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">{friend.friend_profile?.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <Heart className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFriend(friend.friend_id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                {friendRequests.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No friend requests</h3>
                        <p className="text-muted-foreground">
                          Friend requests will appear here when someone wants to connect with you
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {friendRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarImage src={request.sender_profile?.profile_image_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {request.sender_profile?.first_name?.[0]}
                                  {request.sender_profile?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">
                                  {request.sender_profile?.first_name} {request.sender_profile?.last_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">{request.sender_profile?.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Sent {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="add" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Add Friends
                    </CardTitle>
                    <CardDescription>Search for friends by email address</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter friend's email address"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                      />
                      <Button onClick={searchUsers}>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Search Results:</h4>
                        {searchResults.map((result) => (
                          <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={result.profile_image_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {result.first_name?.[0]}
                                  {result.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {result.first_name} {result.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{result.email}</p>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => sendFriendRequest(result.email)}>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add Friend
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
