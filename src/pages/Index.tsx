import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Target, BookOpen, Trophy, Users, TrendingUp, CheckCircle } from 'lucide-react'

const Index = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const features = [
    {
      icon: Target,
      title: 'Daily Practice',
      description: 'Stay consistent with daily quizzes designed to boost your exam performance'
    },
    {
      icon: BookOpen,
      title: 'Subject-wise Tests',
      description: 'Master every topic with comprehensive tests across all PSC subjects'
    },
    {
      icon: Trophy,
      title: 'Mock Exams',
      description: 'Experience real exam conditions with full-length mock tests'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics and performance insights'
    },
    {
      icon: Users,
      title: 'Leaderboard',
      description: 'Compete with fellow aspirants and track your ranking'
    },
    {
      icon: CheckCircle,
      title: 'Current Affairs',
      description: 'Stay updated with daily current affairs and monthly capsules'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">PrepMate</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ace Your PSC Exams with PrepMate
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your comprehensive preparation platform for PSC, UPSC, SSC, and other competitive exams. 
            Practice daily, track progress, and achieve your dreams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Practice
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-card p-6 rounded-lg border">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of aspirants who are already preparing with PrepMate
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">PrepMate</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 PrepMate. Your PSC Exam Success Partner.
          </p>
        </div>
      </footer>
    </div>
  )
};

export default Index;
