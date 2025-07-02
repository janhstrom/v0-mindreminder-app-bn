"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Bell, Calendar, Clock, CheckCircle2, Circle, Edit, Trash2 } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { CreateReminderModal } from "@/components/reminders/create-reminder-modal"

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

interface RemindersPageClientProps {
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

export function RemindersPageClient({ user }: RemindersPageClientProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const { data, error } = await supabase
          .from("reminders")
          .select("*")
          .eq("user_id", user.id)
          .order("reminder_time", { ascending: true })

        if (error) {
          console.error("Error fetching reminders:", error)
          return
        }

        setReminders(data || [])
      } catch (error) {
        console.error("Failed to fetch reminders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth, user.id])

  const toggleReminderComplete = async (reminderId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase.from("reminders").update({ is_completed: !isCompleted }).eq("id", reminderId)

      if (error) {
        console.error("Error updating reminder:", error)
        return
      }

      // Refresh reminders
      await fetchReminders()
    } catch (error) {
      console.error("Failed to update reminder:", error)
    }
  }

  const deleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase.from("reminders").delete().eq("id", reminderId)

      if (error) {
        console.error("Error deleting reminder:", error)
        return
      }

      // Refresh reminders
      await fetchReminders()
    } catch (error) {
      console.error("Failed to delete reminder:", error)
    }
  }

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("reminder_time", { ascending: true })

      if (error) {
        console.error("Error fetching reminders:", error)
        return
      }

      setReminders(data || [])
    } catch (error) {
      console.error("Failed to fetch reminders:", error)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeReminders = reminders.filter((r) => !r.is_completed)
  const completedReminders = reminders.filter((r) => r.is_completed)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
                <p className="text-gray-600 mt-2">Manage your personal reminders and stay organized</p>
              </div>
              <Button onClick={() => setReminderModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Reminder
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Bell className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Reminders</dt>
                        <dd className="text-lg font-medium text-gray-900">{reminders.length}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                        <dd className="text-lg font-medium text-gray-900">{activeReminders.length}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        <dd className="text-lg font-medium text-gray-900">{completedReminders.length}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {reminders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders yet</h3>
                  <p className="text-gray-600 mb-6">Create your first reminder to get started</p>
                  <Button onClick={() => setReminderModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Active Reminders */}
                {activeReminders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Reminders</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {activeReminders.map((reminder) => (
                        <Card key={reminder.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                  {reminder.title}
                                </CardTitle>
                                {reminder.description && (
                                  <CardDescription className="text-sm text-gray-600">
                                    {reminder.description}
                                  </CardDescription>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleReminderComplete(reminder.id, reminder.is_completed)}
                                  className="p-1"
                                >
                                  <Circle className="h-5 w-5 text-gray-400" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-1">
                                  <Edit className="h-4 w-4 text-gray-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteReminder(reminder.id)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDateTime(reminder.reminder_time)}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {reminder.is_recurring && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Recurring
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Reminders */}
                {completedReminders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Reminders</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {completedReminders.map((reminder) => (
                        <Card key={reminder.id} className="opacity-75 hover:opacity-100 transition-opacity">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900 mb-1 line-through">
                                  {reminder.title}
                                </CardTitle>
                                {reminder.description && (
                                  <CardDescription className="text-sm text-gray-600">
                                    {reminder.description}
                                  </CardDescription>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleReminderComplete(reminder.id, reminder.is_completed)}
                                  className="p-1"
                                >
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteReminder(reminder.id)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDateTime(reminder.reminder_time)}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {reminder.is_recurring && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Recurring
                                    </Badge>
                                  )}
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Completed
                                  </Badge>
                                </div>
                              </div>
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

      {/* Modal */}
      <CreateReminderModal open={reminderModalOpen} onOpenChange={setReminderModalOpen} />
    </div>
  )
}
