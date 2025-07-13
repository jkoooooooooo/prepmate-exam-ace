import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
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
  const [dailyStreak, setDailyStreak] = useState(5)
  const [todayQuizCompleted, setTodayQuizCompleted] = useState(false)

  // Sample data - replace with actual data from Supabase
  const stats = {
    totalQuizzes: 42,
    averageScore: 78,
    currentStreak: dailyStreak,
    weeklyProgress: 85,
    rank: 156,
    totalUsers: 2341
  }

  const recentQuizzes = [
    { subject: 'General Knowledge', score: 85, date: '2024-01-12', total: 20 },
    { subject: 'Indian Constitution', score: 72, date: '2024-01-11', total: 15 },
    { subject: 'Current Affairs', score: 90, date: '2024-01-10', total: 25 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.user_metadata?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to continue your exam preparation journey?
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            {stats.currentStreak} day streak
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
                    15 questions • Mixed subjects • 10 minutes
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
                +3 from last week
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
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats.rank}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalUsers.toLocaleString()} users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your quiz completion this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">6 of 7 days completed</span>
                <span className="text-sm font-medium">{stats.weeklyProgress}%</span>
              </div>
              <Progress value={stats.weeklyProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              <div className="flex justify-between">
                {['✅', '✅', '✅', '✅', '✅', '✅', '⭕'].map((status, index) => (
                  <span key={index} className="text-lg">{status}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
              <CardDescription>Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentQuizzes.map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{quiz.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {quiz.score}/{quiz.total} • {new Date(quiz.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{Math.round((quiz.score / quiz.total) * 100)}%</p>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.round((quiz.score / quiz.total) * 5)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/history">
                <Button variant="outline" className="w-full">
                  View All Results
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump into your favorite practice modes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/subjects">
                <Button variant="outline" className="w-full justify-start h-12">
                  <BookOpen className="mr-3 h-4 w-4" />
                  Practice by Subject
                </Button>
              </Link>
              <Link to="/mock-exams">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Calendar className="mr-3 h-4 w-4" />
                  Take Mock Exam
                </Button>
              </Link>
              <Link to="/current-affairs">
                <Button variant="outline" className="w-full justify-start h-12">
                  <TrendingUp className="mr-3 h-4 w-4" />
                  Current Affairs
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Trophy className="mr-3 h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}