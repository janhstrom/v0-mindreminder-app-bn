"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Calendar, Award, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface HeaderUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string | null
  createdAt: string
  emailConfirmed: boolean
}

interface AnalyticsPageClientProps {
  user: HeaderUser
}

interface Analytics {
  totalReminders: number
  completedReminders: number
  totalMicroActions: number
  completedMicroActions: number
  currentStreak: number
  longestStreak: number
  completionRate: number
  weeklyProgress: number[]
}

export function AnalyticsPageClient({ user }: AnalyticsPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [analytics, setAnalytics] = useState<Analytics>({
    totalReminders: 0,
    completedReminders: 0,
    totalMicroActions: 0,
    completedMicroActions: 0,
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch reminders data
      const { data: reminders } = await supabase.from("reminders").select("*").eq("user_id", user.id)

      // Fetch micro actions data
      const { data: microActions } = await supabase.from("micro_actions").select("*").eq("user_id", user.id)

      const totalReminders = reminders?.length || 0
      const completedReminders = reminders?.filter((r) => r.is_completed).length || 0
      const totalMicroActions = microActions?.length || 0
      const completedMicroActions = microActions?.filter((a) => a.is_completed).length || 0

      const totalCompleted = completedReminders + completedMicroActions
      const totalItems = totalReminders + totalMicroActions
      const completionRate = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0

      // Calculate weekly progress (mock data for now)
      const weeklyProgress = [65, 70, 80, 75, 85, 90, 95]

      setAnalytics({
        totalReminders,
        completedReminders,
        totalMicroActions,
        completedMicroActions,
        currentStreak: 7, // Mock data
        longestStreak: 15, // Mock data
        completionRate,
        weeklyProgress,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const achievements = [
    { name: "First Steps", description: "Complete your first reminder", earned: analytics.completedReminders > 0 },
    { name: "Micro Master", description: "Complete 10 micro actions", earned: analytics.completedMicroActions >= 10 },
    { name: "Streak Starter", description: "Maintain a 7-day streak", earned: analytics.currentStreak >= 7 },
    { name: "Consistency King", description: "80% completion rate", earned: analytics.completionRate >= 80 },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Track your progress and achievements</p>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading analytics...</div>
            ) : (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                      <Progress value={analytics.completionRate} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.currentStreak} days</div>
                      <p className="text-xs text-muted-foreground mt-1">Longest: {analytics.longestStreak} days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Reminders</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.completedReminders}</div>
                      <p className="text-xs text-muted-foreground mt-1">of {analytics.totalReminders} completed</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Micro Actions</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.completedMicroActions}</div>
                      <p className="text-xs text-muted-foreground mt-1">of {analytics.totalMicroActions} completed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                    <CardDescription>Your completion rate over the past 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.weeklyProgress.map((progress, index) => {
                        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                        return (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-12 text-sm font-medium">{days[index]}</div>
                            <Progress value={progress} className="flex-1" />
                            <div className="w-12 text-sm text-right">{progress}%</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Achievements
                    </CardTitle>
                    <CardDescription>Your milestones and accomplishments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            achievement.earned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <Badge variant={achievement.earned ? "default" : "secondary"}>
                              {achievement.earned ? "Earned" : "Locked"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Completed 3 reminders today</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Finished 2 micro actions</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">Maintained 7-day streak</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Daily Completion</span>
                            <span>8/10</span>
                          </div>
                          <Progress value={80} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Weekly Streak</span>
                            <span>7/7</span>
                          </div>
                          <Progress value={100} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Monthly Target</span>
                            <span>45/60</span>
                          </div>
                          <Progress value={75} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
