"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Calendar, Target, CheckCircle2 } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"

interface AnalyticsData {
  totalReminders: number
  completedReminders: number
  totalMicroActions: number
  completedMicroActions: number
  currentStreak: number
  weeklyCompletion: number
  monthlyStats: {
    week: string
    completed: number
    total: number
  }[]
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
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
        await fetchAnalytics(user.id)
      } catch (error) {
        console.error("Failed to get user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else if (session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const fetchAnalytics = async (userId: string) => {
    try {
      // Fetch reminders data
      const { data: reminders, error: remindersError } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)

      if (remindersError) {
        console.error("Error fetching reminders:", remindersError)
      }

      // Fetch micro actions data
      const { data: microActions, error: microActionsError } = await supabase
        .from("micro_actions")
        .select("*")
        .eq("user_id", userId)

      if (microActionsError) {
        console.error("Error fetching micro actions:", microActionsError)
      }

      // Calculate analytics
      const totalReminders = reminders?.length || 0
      const completedReminders = reminders?.filter((r) => r.is_completed).length || 0
      const totalMicroActions = microActions?.length || 0
      const completedMicroActions = microActions?.filter((ma) => ma.is_completed).length || 0

      // Calculate weekly completion rate
      const totalItems = totalReminders + totalMicroActions
      const completedItems = completedReminders + completedMicroActions
      const weeklyCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      // Mock data for streak and monthly stats (you can implement real calculation)
      const currentStreak = 7 // This would be calculated based on completion history
      const monthlyStats = [
        { week: "Week 1", completed: 12, total: 15 },
        { week: "Week 2", completed: 18, total: 20 },
        { week: "Week 3", completed: 14, total: 18 },
        { week: "Week 4", completed: 16, total: 19 },
      ]

      setAnalytics({
        totalReminders,
        completedReminders,
        totalMicroActions,
        completedMicroActions,
        currentStreak,
        weeklyCompletion,
        monthlyStats,
      })
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Track your progress and habits over time</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                        <dd className="text-lg font-medium text-gray-900">{analytics.weeklyCompletion}%</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Current Streak</dt>
                        <dd className="text-lg font-medium text-gray-900">{analytics.currentStreak} days</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Actions</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.totalReminders + analytics.totalMicroActions}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.completedReminders + analytics.completedMicroActions}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Reminders vs Micro Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Breakdown</CardTitle>
                  <CardDescription>Your reminders and micro actions overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Reminders</span>
                      <span className="text-sm text-gray-500">
                        {analytics.completedReminders}/{analytics.totalReminders}
                      </span>
                    </div>
                    <Progress
                      value={
                        analytics.totalReminders > 0
                          ? (analytics.completedReminders / analytics.totalReminders) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Micro Actions</span>
                      <span className="text-sm text-gray-500">
                        {analytics.completedMicroActions}/{analytics.totalMicroActions}
                      </span>
                    </div>
                    <Progress
                      value={
                        analytics.totalMicroActions > 0
                          ? (analytics.completedMicroActions / analytics.totalMicroActions) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                  <CardDescription>Weekly completion rates for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.monthlyStats.map((week, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{week.week}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {week.completed}/{week.total}
                          </span>
                          <Badge
                            variant={week.completed / week.total >= 0.8 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {Math.round((week.completed / week.total) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                  <CardDescription>Your latest milestones and accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">7-day streak achieved!</span>
                      <Badge variant="secondary" className="text-xs">
                        2 days ago
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Completed 50 micro actions</span>
                      <Badge variant="secondary" className="text-xs">
                        1 week ago
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Perfect week completion</span>
                      <Badge variant="secondary" className="text-xs">
                        2 weeks ago
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Habits Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Habits Summary</CardTitle>
                  <CardDescription>Overview of your habit-building progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Best Streak</span>
                      <span className="text-sm font-medium">12 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Daily Completion</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Most Active Day</span>
                      <span className="text-sm font-medium">Monday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Days Active</span>
                      <span className="text-sm font-medium">28 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
