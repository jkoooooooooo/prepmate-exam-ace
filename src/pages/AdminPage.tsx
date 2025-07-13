import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Users, BookOpen, BarChart3 } from 'lucide-react'

export default function AdminPage() {
  // In a real app, you'd check if user has admin permissions
  const stats = {
    totalUsers: 2341,
    totalQuestions: 1250,
    activeQuizzes: 15,
    avgScore: 76
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage questions, users, and quiz content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +25 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Across all subjects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
              <p className="text-xs text-muted-foreground">
                +3% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel */}
        <AdminPanel />
      </div>
    </DashboardLayout>
  )
}