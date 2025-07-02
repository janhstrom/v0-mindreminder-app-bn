"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, CheckCircle, Clock, Trash2 } from "lucide-react"
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

interface MicroAction {
  id: string
  title: string
  description?: string
  category: string
  is_completed: boolean
  created_at: string
}

interface MicroActionsPageClientProps {
  user: HeaderUser
}

export function MicroActionsPageClient({ user }: MicroActionsPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [microActions, setMicroActions] = useState<MicroAction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMicroActions()
  }, [])

  const fetchMicroActions = async () => {
    try {
      const { data, error } = await supabase
        .from("micro_actions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setMicroActions(data || [])
    } catch (error) {
      console.error("Error fetching micro actions:", error)
      toast.error("Failed to load micro actions")
    } finally {
      setLoading(false)
    }
  }

  const completeMicroAction = async (id: string) => {
    try {
      const { error } = await supabase.from("micro_actions").update({ is_completed: true }).eq("id", id)

      if (error) throw error

      setMicroActions((prev) => prev.map((action) => (action.id === id ? { ...action, is_completed: true } : action)))
      toast.success("Micro action completed!")
    } catch (error) {
      console.error("Error completing micro action:", error)
      toast.error("Failed to complete micro action")
    }
  }

  const deleteMicroAction = async (id: string) => {
    try {
      const { error } = await supabase.from("micro_actions").delete().eq("id", id)

      if (error) throw error

      setMicroActions((prev) => prev.filter((action) => action.id !== id))
      toast.success("Micro action deleted!")
    } catch (error) {
      console.error("Error deleting micro action:", error)
      toast.error("Failed to delete micro action")
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      health: "bg-green-100 text-green-800",
      productivity: "bg-blue-100 text-blue-800",
      mindfulness: "bg-purple-100 text-purple-800",
      social: "bg-pink-100 text-pink-800",
      learning: "bg-yellow-100 text-yellow-800",
      default: "bg-gray-100 text-gray-800",
    }
    return colors[category.toLowerCase()] || colors.default
  }

  const activeActions = microActions.filter((a) => !a.is_completed)
  const completedActions = microActions.filter((a) => a.is_completed)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Micro Actions</h1>
                <p className="text-gray-600 mt-1">Small steps that lead to big changes</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Micro Action
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeActions.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      completedActions.filter(
                        (a) => new Date(a.created_at).toDateString() === new Date().toDateString(),
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{microActions.length}</div>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading micro actions...</div>
            ) : (
              <div className="space-y-6">
                {/* Active Micro Actions */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Active Micro Actions</h2>
                  {activeActions.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No active micro actions</p>
                        <Button className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create your first micro action
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {activeActions.map((action) => (
                        <Card key={action.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{action.title}</h3>
                                  <Badge className={getCategoryColor(action.category)}>{action.category}</Badge>
                                </div>
                                {action.description && <p className="text-gray-600 text-sm">{action.description}</p>}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" onClick={() => completeMicroAction(action.id)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteMicroAction(action.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Micro Actions */}
                {completedActions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Completed Micro Actions</h2>
                    <div className="grid gap-4">
                      {completedActions.slice(0, 5).map((action) => (
                        <Card key={action.id} className="opacity-75">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold line-through">{action.title}</h3>
                                  <Badge className={getCategoryColor(action.category)}>{action.category}</Badge>
                                </div>
                                {action.description && (
                                  <p className="text-gray-600 text-sm line-through">{action.description}</p>
                                )}
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  Completed
                                </div>
                              </div>
                              <Badge variant="secondary">Done</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
