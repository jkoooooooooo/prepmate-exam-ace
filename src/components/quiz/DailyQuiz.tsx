import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, XCircle, Brain } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface DailyQuizProps {
  onComplete?: (score: number, total: number) => void
}

export function DailyQuiz({ onComplete }: DailyQuizProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDailyQuestions()
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !quizCompleted) {
      handleQuizComplete()
    }
  }, [timeLeft, quizCompleted])

  const fetchDailyQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our Question interface
      const transformedQuestions = (data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options.map(String) : [],
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        explanation: q.explanation || ''
      }))

      setQuestions(transformedQuestions)
      setSelectedAnswers(new Array(transformedQuestions.length).fill(-1))
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz questions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

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
    if (selectedAnswers[currentQuestion] === -1) {
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
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleQuizComplete()
    }
  }

  const handleQuizComplete = async () => {
    if (!user) return

    const finalScore = selectedAnswers.reduce((total, answer, index) => {
      return total + (answer === questions[index]?.correct_answer ? 1 : 0)
    }, 0)
    
    setScore(finalScore)

    try {
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id,
          questions: questions as any,
          user_answers: selectedAnswers as any,
          score: finalScore,
          total_questions: questions.length,
          quiz_type: 'daily'
        })

      if (error) throw error

      toast({
        title: 'Quiz Completed!',
        description: `You scored ${finalScore} out of ${questions.length}`,
      })
    } catch (error) {
      console.error('Error saving quiz result:', error)
      toast({
        title: "Error",
        description: "Failed to save quiz result.",
        variant: "destructive"
      })
    }

    setQuizCompleted(true)
    onComplete?.(finalScore, questions.length)
  }

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">Loading quiz...</div>
        </CardContent>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">No questions available</div>
        </CardContent>
      </Card>
    )
  }

  const currentQ = questions[currentQuestion]
  const isCorrect = selectedAnswers[currentQuestion] === currentQ.correct_answer
  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (quizCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🎉 Quiz Completed!</CardTitle>
          <CardDescription>Great job on completing today's quiz</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary">
            {score}/{questions.length}
          </div>
          <div className="text-xl">
            Score: {Math.round((score / questions.length) * 100)}%
          </div>
          
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < Math.round((score / questions.length) * 5)
                    ? 'bg-yellow-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 text-left">
                <h4 className="font-medium mb-2">{question.question}</h4>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      className={`p-2 rounded ${
                        optionIndex === question.correct_answer
                          ? 'bg-green-100 text-green-800'
                          : selectedAnswers[index] === optionIndex
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-50'
                      }`}
                    >
                      {option}
                      {optionIndex === question.correct_answer && (
                        <CheckCircle className="inline h-4 w-4 ml-2" />
                      )}
                      {selectedAnswers[index] === optionIndex && optionIndex !== question.correct_answer && (
                        <XCircle className="inline h-4 w-4 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Take Another Quiz
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
                Question {currentQuestion + 1} of {questions.length}
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
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="mr-3 font-semibold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
              
              <Button onClick={handleNext} className="w-full" size="lg">
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
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
                {currentQuestion === questions.length - 1 ? 'View Results' : 'Continue'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}