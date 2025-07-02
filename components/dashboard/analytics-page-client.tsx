"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Target, CheckCircle2, Calendar } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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

interface MonthlyStat {
  week: string
  completed: number
  total: number
}

export function AnalyticsPageClient({ user }: Props) {
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    totalReminders: number
    completedReminders: number
    totalMicroActions: number
    completedMicroActions: number
    weeklyCompletion: number
    currentStreak: number
    monthlyStats: MonthlyStat[]
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: reminders } = await supabase.from("reminders").select("*").eq("user_id", user.id)
      const { data: actions } = await supabase.from("micro_actions").select("*").eq("user_id", user.id)

      const totalRem = reminders?.length ?? 0
      const compRem = reminders?.filter((r) => r.is_completed).length ?? 0
      const totalAct = actions?.length ?? 0
      const compAct = actions?.filter((a) => a.is_completed).length ?? 0
      const totalItems = totalRem + totalAct
      const completedItems = compRem + compAct
      const weeklyCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      setStats({
        totalReminders: totalRem,
        completedReminders: compRem,
        totalMicroActions: totalAct,
        completedMicroActions: compAct,
        weeklyCompletion,
        currentStreak: 7, // placeholder
        monthlyStats: [
          { week: "Week 1", completed: 10, total: 14 },
          { week: "Week 2", completed: 12, total: 14 },
          { week: "Week 3", completed: 11, total: 14 },
          { week: "Week 4", completed: 13, total: 14 },
        ],
      })
      setLoading(false)
    }
    load()
  }, [supabase, user.id])

  if (loading || !stats) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Header user={user} setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8 space-y-8">
            <h1 className="text-3xl font-bold">Analytics</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Completion</p>
                    <p className="text-2xl font-bold">{stats.weeklyCompletion}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-2xl font-bold">{stats.currentStreak} days</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Actions</p>
                    <p className="text-2xl font-bold">{stats.totalReminders + stats.totalMicroActions}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <CheckCircle2 className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{stats.completedReminders + stats.completedMicroActions}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
                <CardDescription>Reminders vs Micro Actions completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Reminders</span>
                    <span>
                      {stats.completedReminders}/{stats.totalReminders}
                    </span>
                  </div>
                  <Progress
                    value={stats.totalReminders ? (stats.completedReminders / stats.totalReminders) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Micro Actions</span>
                    <span>
                      {stats.completedMicroActions}/{stats.totalMicroActions}
                    </span>
                  </div>
                  <Progress
                    value={stats.totalMicroActions ? (stats.completedMicroActions / stats.totalMicroActions) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress</CardTitle>
                <CardDescription>Weekly completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.monthlyStats.map((w) => (
                  <div key={w.week} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{w.week}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        {w.completed}/{w.total}
                      </span>
                      <Badge variant={w.completed / w.total >= 0.8 ? "default" : "secondary"} className="text-xs">
                        {Math.round((w.completed / w.total) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
