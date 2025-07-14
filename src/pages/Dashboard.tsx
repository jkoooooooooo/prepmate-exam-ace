import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { 
  Target, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Flame,
  Clock,
  Star
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [recentResults, setRecentResults] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    streakCount: 0,
    totalScore: 0
  })
  const [todayQuizCompleted, setTodayQuizCompleted] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      // Fetch recent quiz results
      const { data: resultsData } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5)

      setRecentResults(resultsData || [])

      // Check if today's quiz is completed
      const today = new Date().toISOString().split('T')[0]
      const todayResult = resultsData?.find(result => 
        result.completed_at.startsWith(today) && result.quiz_type === 'daily'
      )
      setTodayQuizCompleted(!!todayResult)

      // Calculate stats
      if (resultsData && resultsData.length > 0) {
        const totalQuizzes = resultsData.length
        const totalScore = resultsData.reduce((sum, result) => sum + result.score, 0)
        const totalPossible = resultsData.reduce((sum, result) => sum + result.total_questions, 0)
        const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0

        setStats({
          totalQuizzes,
          averageScore,
          streakCount: profileData?.streak_count || 0,
          totalScore: profileData?.total_score || 0
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {profile?.full_name || user?.email}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to continue your exam preparation journey?
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            {stats.streakCount} day streak
          </Badge>
        </div>

        {/* Daily Quiz Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Today's Quiz
                </CardTitle>
                <CardDescription>
                  Complete your daily practice to maintain your streak
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {todayQuizCompleted ? '✅' : '🎯'}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!todayQuizCompleted ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    5 questions • Mixed subjects • 10 minutes
                  </p>
                  <Link to="/quiz/daily">
                    <Button size="lg" className="font-semibold">
                      Start Daily Quiz
                    </Button>
                  </Link>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Ready to go!</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Trophy className="h-12 w-12 text-accent mx-auto mb-2" />
                <p className="font-semibold">Today's quiz completed!</p>
                <p className="text-sm text-muted-foreground">Great job! Come back tomorrow for more practice.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Completed quizzes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streakCount} days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScore}</div>
              <p className="text-xs text-muted-foreground">
                Points earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
              <CardDescription>Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentResults.length > 0 ? (
                <>
                  {recentResults.map((result, index) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium capitalize">{result.quiz_type} Quiz</p>
                        <p className="text-sm text-muted-foreground">
                          {result.score}/{result.total_questions} • {new Date(result.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{Math.round((result.score / result.total_questions) * 100)}%</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round((result.score / result.total_questions) * 5)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quiz results yet</p>
                  <p className="text-sm text-muted-foreground">Take your first quiz to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump into your favorite practice modes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/quiz/daily">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Target className="mr-3 h-4 w-4" />
                  Daily Quiz
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" className="w-full justify-start h-12">
                  <BookOpen className="mr-3 h-4 w-4" />
                  Manage Questions
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start h-12 opacity-50" disabled>
                <Calendar className="mr-3 h-4 w-4" />
                Mock Exam (Coming Soon)
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 opacity-50" disabled>
                <TrendingUp className="mr-3 h-4 w-4" />
                Current Affairs (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}