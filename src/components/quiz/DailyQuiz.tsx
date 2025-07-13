import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Clock, CheckCircle, XCircle, Brain } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Sample questions - replace with data from Supabase
const sampleQuestions = [
  {
    id: '1',
    question: 'Who is known as the Father of the Indian Constitution?',
    options: [
      'Mahatma Gandhi',
      'Dr. B.R. Ambedkar',
      'Jawaharlal Nehru',
      'Sardar Vallabhbhai Patel'
    ],
    correct_answer: 1,
    explanation: 'Dr. B.R. Ambedkar is known as the Father of the Indian Constitution for his pivotal role as the chairman of the Drafting Committee.',
    subject: 'Indian Constitution',
    difficulty: 'medium'
  },
  {
    id: '2',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct_answer: 1,
    explanation: 'Mars is known as the Red Planet due to iron oxide (rust) on its surface, which gives it a reddish appearance.',
    subject: 'Science',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'The capital of Kerala is:',
    options: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
    correct_answer: 1,
    explanation: 'Thiruvananthapuram is the capital city of Kerala, located in the southern part of the state.',
    subject: 'Geography',
    difficulty: 'easy'
  }
]

interface DailyQuizProps {
  onComplete?: (score: number, total: number) => void
}

export function DailyQuiz({ onComplete }: DailyQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [score, setScore] = useState(0)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !quizCompleted) {
      handleQuizComplete()
    }
  }, [timeLeft, quizCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (selectedAnswers[currentQuestion] === undefined) {
      toast({
        variant: 'destructive',
        title: 'Please select an answer',
        description: 'You must select an answer before proceeding.',
      })
      return
    }

    setShowExplanation(true)
  }

  const handleContinue = () => {
    setShowExplanation(false)
    
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleQuizComplete()
    }
  }

  const handleQuizComplete = () => {
    const finalScore = selectedAnswers.reduce((total, answer, index) => {
      return total + (answer === sampleQuestions[index].correct_answer ? 1 : 0)
    }, 0)
    
    setScore(finalScore)
    setQuizCompleted(true)
    onComplete?.(finalScore, sampleQuestions.length)
    
    toast({
      title: 'Quiz Completed!',
      description: `You scored ${finalScore} out of ${sampleQuestions.length}`,
    })
  }

  const currentQ = sampleQuestions[currentQuestion]
  const isCorrect = selectedAnswers[currentQuestion] === currentQ.correct_answer
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100

  if (quizCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🎉 Quiz Completed!</CardTitle>
          <CardDescription>Great job on completing today's quiz</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary">
            {score}/{sampleQuestions.length}
          </div>
          <div className="text-xl">
            Score: {Math.round((score / sampleQuestions.length) * 100)}%
          </div>
          
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < Math.round((score / sampleQuestions.length) * 5)
                    ? 'bg-yellow-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/leaderboard')} className="w-full">
              View Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{currentQ.subject}</Badge>
            <Badge variant={currentQ.difficulty === 'easy' ? 'default' : currentQ.difficulty === 'medium' ? 'secondary' : 'destructive'}>
              {currentQ.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showExplanation ? (
            <>
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <Button onClick={handleNext} className="w-full" size="lg">
                {currentQuestion === sampleQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </>
          ) : (
            <>
              {/* Show correct answer and explanation */}
              <div className="space-y-4">
                {currentQ.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border ${
                      index === currentQ.correct_answer
                        ? 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                        : index === selectedAnswers[currentQuestion] && index !== currentQ.correct_answer
                        ? 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                        : 'bg-muted/30'
                    }`}
                  >
                    {index === currentQ.correct_answer ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : index === selectedAnswers[currentQuestion] && index !== currentQ.correct_answer ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                    <span className={`flex-1 ${
                      index === currentQ.correct_answer ? 'font-semibold text-green-800 dark:text-green-200' : ''
                    }`}>
                      {option}
                    </span>
                  </div>
                ))}

                <div className={`p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-blue-50 border border-blue-200 dark:bg-blue-900/10 dark:border-blue-800'
                }`}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Correct!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        Incorrect
                      </>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                </div>
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg">
                {currentQuestion === sampleQuestions.length - 1 ? 'View Results' : 'Continue'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}