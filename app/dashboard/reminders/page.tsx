"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Bell, Calendar, Clock, CheckCircle2, Circle } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"

interface Reminder {
  id: string
  title: string
  description: string
  reminder_time: string
  is_recurring: boolean
  recurrence_pattern: string
  is_completed: boolean
  created_at: string
}

export default function RemindersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Auth error:", error)
          router.push("/login")
          return
        }

        if (!user) {
          router.push("/login")
          return
        }

        setUser(user)
        await fetchReminders(user.id)
      } catch (error) {
        console.error("Failed to get user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

  const fetchReminders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
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

  const toggleReminderComplete = async (reminderId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase.from("reminders").update({ is_completed: !isCompleted }).eq("id", reminderId)

      if (error) {
        console.error("Error updating reminder:", error)
        return
      }

      // Refresh reminders
      if (user) {
        await fetchReminders(user.id)
      }
    } catch (error) {
      console.error("Failed to update reminder:", error)
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
                <p className="text-gray-600 mt-2">Manage your personal reminders and stay organized</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Reminder
              </Button>
            </div>

            {reminders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders yet</h3>
                  <p className="text-gray-600 mb-6">Create your first reminder to get started</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{reminder.title}</CardTitle>
                          {reminder.description && (
                            <CardDescription className="text-sm text-gray-600">{reminder.description}</CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReminderComplete(reminder.id, reminder.is_completed)}
                          className="ml-2 p-1"
                        >
                          {reminder.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
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
                            {reminder.is_completed && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
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
