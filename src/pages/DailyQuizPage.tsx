import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DailyQuiz } from '@/components/quiz/DailyQuiz'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Calendar } from 'lucide-react'

export default function DailyQuizPage() {
  const handleQuizComplete = (score: number, total: number) => {
    // Here you would typically save the result to Supabase
    console.log('Quiz completed:', { score, total })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6" />
              Daily Quiz Challenge
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Test your knowledge with today's carefully curated questions. 
              Complete the quiz to maintain your learning streak!
            </p>
          </CardContent>
        </Card>

        {/* Quiz Component */}
        <DailyQuiz onComplete={handleQuizComplete} />
      </div>
    </DashboardLayout>
  )
}