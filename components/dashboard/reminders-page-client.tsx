"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Circle, CheckCircle2, Edit, Plus, Trash2 } from "lucide-react"
import { CreateReminderModal } from "@/components/reminders/create-reminder-modal"

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

interface Reminder {
  id: string
  title: string
  description: string
  reminder_time: string
  is_recurring: boolean
  recurrence_pattern: string | null
  is_completed: boolean
  created_at: string
}

export function RemindersPageClient({ user }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("reminder_time", { ascending: true })
      if (error) console.error(error)
      setReminders(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase, user.id])

  const refresh = () =>
    supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("reminder_time", { ascending: true })
      .then(({ data }) => setReminders(data ?? []))

  const toggleComplete = async (id: string, done: boolean) => {
    await supabase.from("reminders").update({ is_completed: !done }).eq("id", id)
    refresh()
  }

  const del = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id)
    refresh()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const active = reminders.filter((r) => !r.is_completed)
  const completed = reminders.filter((r) => r.is_completed)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Reminders</h1>
                <p className="text-gray-600">Stay organized and mindful</p>
              </div>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Reminder
              </Button>
            </div>

            {active.length === 0 && completed.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <Bell className="mx-auto h-10 w-10 text-gray-400" />
                  <p>No reminders yet</p>
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {active.length > 0 && (
                  <>
                    <h2 className="font-semibold mb-2">Active</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {active.map((r) => (
                        <Card key={r.id}>
                          <CardHeader className="pb-2">
                            <CardTitle>{r.title}</CardTitle>
                            {r.description && <CardDescription>{r.description}</CardDescription>}
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(r.reminder_time).toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" onClick={() => toggleComplete(r.id, r.is_completed)}>
                                <Circle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => del(r.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {completed.length > 0 && (
                  <>
                    <h2 className="font-semibold mt-10 mb-2">Completed</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {completed.map((r) => (
                        <Card key={r.id} className="opacity-75">
                          <CardHeader className="pb-2">
                            <CardTitle className="line-through">{r.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex items-center justify-between">
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" /> done
                            </Badge>
                            <Button size="icon" variant="ghost" onClick={() => del(r.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
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

      <CreateReminderModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
