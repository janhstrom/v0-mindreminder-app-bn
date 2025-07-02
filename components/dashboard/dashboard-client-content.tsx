"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, Target, Users, TrendingUp, Plus, CheckCircle2, Clock } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import Link from "next/link"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImage: string | null
  createdAt: string
  emailConfirmed: boolean
}

interface DashboardClientContentProps {
  user: User
}

interface DashboardStats {
  totalReminders: number
  activeReminders: number
  completedReminders: number
  totalMicroActions: number
  completedMicroActions: number
  weeklyProgress: number
  currentStreak: number
}

export function DashboardClientContent({ user }: DashboardClientContentProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalReminders: 0,
    activeReminders: 0,
    completedReminders: 0,
    totalMicroActions: 0,
    completedMicroActions: 0,
    weeklyProgress: 0,
    currentStreak: 0,
  })
  const [recentReminders, setRecentReminders] = useState<any[]>([])
  const [recentMicroActions, setRecentMicroActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()

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

  const fetchDashboardData = async () => {
    try {
      // Fetch reminders
      const { data: reminders, error: remindersError } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (remindersError) {
        console.error("Error fetching reminders:", remindersError)
      }

      // Fetch micro actions
      const { data: microActions, error: microActionsError } = await supabase
        .from("micro_actions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (microActionsError) {
        console.error("Error fetching micro actions:", microActionsError)
      }

      // Calculate stats
      const totalReminders = reminders?.length || 0
      const completedReminders = reminders?.filter((r) => r.is_completed).length || 0
      const activeReminders = totalReminders - completedReminders

      const totalMicroActions = microActions?.length || 0
      const completedMicroActions = microActions?.filter((ma) => ma.is_completed).length || 0

      const totalItems = totalReminders + totalMicroActions
      const completedItems = completedReminders + completedMicroActions
      const weeklyProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      setStats({
        totalReminders,
        activeReminders,
        completedReminders,
        totalMicroActions,
        completedMicroActions,
        weeklyProgress,
        currentStreak: 5, // Mock data for now
      })

      setRecentReminders(reminders?.slice(0, 3) || [])
      setRecentMicroActions(microActions?.slice(0, 3) || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
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
        <Header user={user} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName || user.email.split("@")[0]}!
              </h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your mindfulness journey today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Bell className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Reminders</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.activeReminders}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Micro Actions</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalMicroActions}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Weekly Progress</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.weeklyProgress}%</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Current Streak</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.currentStreak} days</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>Your completion rate this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Completion</span>
                        <span className="text-sm text-gray-500">{stats.weeklyProgress}%</span>
                      </div>
                      <Progress value={stats.weeklyProgress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Reminders</span>
                        <span className="text-sm text-gray-500">
                          {stats.completedReminders}/{stats.totalReminders}
                        </span>
                      </div>
                      <Progress
                        value={stats.totalReminders > 0 ? (stats.completedReminders / stats.totalReminders) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Micro Actions</span>
                        <span className="text-sm text-gray-500">
                          {stats.completedMicroActions}/{stats.totalMicroActions}
                        </span>
                      </div>
                      <Progress
                        value={
                          stats.totalMicroActions > 0
                            ? (stats.completedMicroActions / stats.totalMicroActions) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Get started with your mindfulness practice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/dashboard/reminders">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Reminder
                    </Button>
                  </Link>
                  <Link href="/dashboard/micro-actions">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Add Micro Action
                    </Button>
                  </Link>
                  <Link href="/dashboard/friends">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Connect with Friends
                    </Button>
                  </Link>
                  <Link href="/dashboard/analytics">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Reminders</CardTitle>
                    <CardDescription>Your latest reminders</CardDescription>
                  </div>
                  <Link href="/dashboard/reminders">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentReminders.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No reminders yet</p>
                      <Link href="/dashboard/reminders">
                        <Button size="sm" className="mt-2">
                          Create Your First Reminder
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentReminders.map((reminder) => (
                        <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {reminder.is_completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{reminder.title}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(reminder.reminder_time).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={reminder.is_completed ? "default" : "secondary"}>
                            {reminder.is_completed ? "Done" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Micro Actions</CardTitle>
                    <CardDescription>Your latest micro actions</CardDescription>
                  </div>
                  <Link href="/dashboard/micro-actions">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentMicroActions.length === 0 ? (
                    <div className="text-center py-6">
                      <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No micro actions yet</p>
                      <Link href="/dashboard/micro-actions">
                        <Button size="sm" className="mt-2">
                          Create Your First Action
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentMicroActions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {action.is_completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Target className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{action.title}</p>
                              <p className="text-xs text-gray-500 capitalize">{action.category}</p>
                            </div>
                          </div>
                          <Badge variant={action.is_completed ? "default" : "secondary"}>
                            {action.is_completed ? "Done" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
