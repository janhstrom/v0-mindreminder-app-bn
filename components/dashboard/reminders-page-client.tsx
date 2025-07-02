"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Bell, Clock, CheckCircle, Trash2 } from "lucide-react"
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

interface Reminder {
  id: string
  title: string
  description?: string
  reminder_time: string
  is_completed: boolean
  created_at: string
}

interface RemindersPageClientProps {
  user: HeaderUser
}

export function RemindersPageClient({ user }: RemindersPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("reminder_time", { ascending: true })

      if (error) throw error
      setReminders(data || [])
    } catch (error) {
      console.error("Error fetching reminders:", error)
      toast.error("Failed to load reminders")
    } finally {
      setLoading(false)
    }
  }

  const completeReminder = async (id: string) => {
    try {
      const { error } = await supabase.from("reminders").update({ is_completed: true }).eq("id", id)

      if (error) throw error

      setReminders((prev) =>
        prev.map((reminder) => (reminder.id === id ? { ...reminder, is_completed: true } : reminder)),
      )
      toast.success("Reminder completed!")
    } catch (error) {
      console.error("Error completing reminder:", error)
      toast.error("Failed to complete reminder")
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase.from("reminders").delete().eq("id", id)

      if (error) throw error

      setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
      toast.success("Reminder deleted!")
    } catch (error) {
      console.error("Error deleting reminder:", error)
      toast.error("Failed to delete reminder")
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
  }

  const activeReminders = reminders.filter((r) => !r.is_completed)
  const completedReminders = reminders.filter((r) => r.is_completed)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
                <p className="text-gray-600 mt-1">Manage your personal reminders and stay on track</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeReminders.length}</div>
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
                      completedReminders.filter(
                        (r) => new Date(r.created_at).toDateString() === new Date().toDateString(),
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reminders.length}</div>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading reminders...</div>
            ) : (
              <div className="space-y-6">
                {/* Active Reminders */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Active Reminders</h2>
                  {activeReminders.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No active reminders</p>
                        <Button className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create your first reminder
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {activeReminders.map((reminder) => (
                        <Card key={reminder.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold">{reminder.title}</h3>
                                {reminder.description && (
                                  <p className="text-gray-600 text-sm mt-1">{reminder.description}</p>
                                )}
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatTime(reminder.reminder_time)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" onClick={() => completeReminder(reminder.id)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteReminder(reminder.id)}>
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

                {/* Completed Reminders */}
                {completedReminders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Completed Reminders</h2>
                    <div className="grid gap-4">
                      {completedReminders.slice(0, 5).map((reminder) => (
                        <Card key={reminder.id} className="opacity-75">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold line-through">{reminder.title}</h3>
                                {reminder.description && (
                                  <p className="text-gray-600 text-sm mt-1 line-through">{reminder.description}</p>
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
