"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, CheckCircle2, Circle, Zap, Edit, Trash2 } from "lucide-react"
import { CreateMicroActionModal } from "@/components/micro-actions/create-micro-action-modal"

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

interface MicroAction {
  id: string
  title: string
  description: string
  category: string
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

export function MicroActionsPageClient({ user }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actions, setActions] = useState<MicroAction[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("micro_actions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (error) console.error(error)
      setActions(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase, user.id])

  const refresh = () =>
    supabase
      .from("micro_actions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setActions(data ?? []))

  const toggle = async (id: string, done: boolean) => {
    await supabase
      .from("micro_actions")
      .update({
        is_completed: !done,
        completed_at: !done ? new Date().toISOString() : null,
      })
      .eq("id", id)
    refresh()
  }

  const del = async (id: string) => {
    await supabase.from("micro_actions").delete().eq("id", id)
    refresh()
  }

  const badgeColor = (cat: string) => {
    const map: Record<string, string> = {
      health: "bg-green-100 text-green-800",
      productivity: "bg-blue-100 text-blue-800",
      mindfulness: "bg-purple-100 text-purple-800",
      learning: "bg-yellow-100 text-yellow-800",
      social: "bg-pink-100 text-pink-800",
    }
    return map[cat] ?? "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const completed = actions.filter((a) => a.is_completed)
  const pending = actions.filter((a) => !a.is_completed)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Micro Actions</h1>
                <p className="text-gray-600">Small steps leading to big change</p>
              </div>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Action
              </Button>
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{actions.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{completed.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Zap className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{pending.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {actions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <Target className="mx-auto h-10 w-10 text-gray-400" />
                  <p>No micro actions yet</p>
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Action
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* pending */}
                {pending.length > 0 && (
                  <>
                    <h2 className="font-semibold mb-2">Pending</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pending.map((a) => (
                        <Card key={a.id}>
                          <CardHeader className="pb-2">
                            <CardTitle>{a.title}</CardTitle>
                            {a.description && <CardDescription>{a.description}</CardDescription>}
                          </CardHeader>
                          <CardContent className="flex items-center justify-between">
                            <Badge className={badgeColor(a.category)}>{a.category}</Badge>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => toggle(a.id, a.is_completed)}>
                                <Circle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => del(a.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {/* completed */}
                {completed.length > 0 && (
                  <>
                    <h2 className="font-semibold mt-10 mb-2">Completed</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {completed.map((a) => (
                        <Card key={a.id} className="opacity-75">
                          <CardHeader className="pb-2">
                            <CardTitle className="line-through">{a.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex items-center justify-between">
                            <Badge className={badgeColor(a.category)}>{a.category}</Badge>
                            {a.completed_at && (
                              <span className="text-xs text-gray-500">
                                {new Date(a.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <CreateMicroActionModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
