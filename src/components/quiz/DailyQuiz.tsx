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

interface SubQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  trigger_answer_index: number
  sub_question_order: number
}

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  question_type?: 'base' | 'sub'
  parent_question_id?: string
  trigger_answer_index?: number
  sub_question_order?: number
  sub_questions?: SubQuestion[]
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
  
  // Sub-question state management
  const [currentSubQuestions, setCurrentSubQuestions] = useState<SubQuestion[]>([])
  const [currentSubQuestionIndex, setCurrentSubQuestionIndex] = useState(0)
  const [isInSubQuestion, setIsInSubQuestion] = useState(false)
  const [subQuestionAnswers, setSubQuestionAnswers] = useState<number[]>([])
  const [showSubExplanation, setShowSubExplanation] = useState(false)
  
  // Track all answered questions for scoring
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState<Array<{
    question: Question | SubQuestion
    userAnswer: number
    isCorrect: boolean
    isSubQuestion: boolean
  }>>([])
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0)

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
      // First, fetch only base questions
      const { data: baseQuestions, error: baseError } = await supabase
        .from('questions')
        .select('*')
        .eq('question_type', 'base')
        .limit(5)
        .order('created_at', { ascending: false })

      if (baseError) throw baseError

      // For each base question, fetch its sub-questions
      const questionsWithSubs = await Promise.all(
        (baseQuestions || []).map(async (baseQuestion) => {
          const { data: subQuestions, error: subError } = await supabase
            .from('questions')
            .select('*')
            .eq('parent_question_id', baseQuestion.id)
            .order('sub_question_order', { ascending: true })

          if (subError) {
            console.warn('Error fetching sub-questions for', baseQuestion.id, subError)
          }

          // Transform sub-questions
          const transformedSubQuestions = (subQuestions || []).map(sq => ({
            ...sq,
            options: Array.isArray(sq.options) ? sq.options.map(String) : [],
            difficulty: sq.difficulty as 'easy' | 'medium' | 'hard',
            explanation: sq.explanation || ''
          }))

          // Transform base question and add sub-questions
          return {
            ...baseQuestion,
            options: Array.isArray(baseQuestion.options) ? baseQuestion.options.map(String) : [],
            difficulty: baseQuestion.difficulty as 'easy' | 'medium' | 'hard',
            explanation: baseQuestion.explanation || '',
            sub_questions: transformedSubQuestions
          }
        })
      )

      setQuestions(questionsWithSubs)
      setSelectedAnswers(new Array(questionsWithSubs.length).fill(-1))
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
    if (isInSubQuestion) {
      const newSubAnswers = [...subQuestionAnswers]
      newSubAnswers[currentSubQuestionIndex] = answerIndex
      setSubQuestionAnswers(newSubAnswers)
    } else {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestion] = answerIndex
      setSelectedAnswers(newAnswers)
    }
  }

  const handleNext = () => {
    if (isInSubQuestion) {
      // Handle sub-question answer
      if (subQuestionAnswers[currentSubQuestionIndex] === -1) {
        toast({
          variant: 'destructive',
          title: 'Please select an answer',
          description: 'You must select an answer before proceeding.',
        })
        return
      }
      setShowSubExplanation(true)
    } else {
      // Handle main question answer
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
  }

  const handleContinue = () => {
    if (isInSubQuestion) {
      // Record sub-question answer
      const currentSubQ = currentSubQuestions[currentSubQuestionIndex]
      const userAnswer = subQuestionAnswers[currentSubQuestionIndex]
      const isCorrect = userAnswer === currentSubQ.correct_answer
      
      setAllAnsweredQuestions(prev => [...prev, {
        question: currentSubQ,
        userAnswer,
        isCorrect,
        isSubQuestion: true
      }])
      setTotalQuestionsAnswered(prev => prev + 1)
      
      // Continue with sub-questions
      setShowSubExplanation(false)
      
      if (currentSubQuestionIndex < currentSubQuestions.length - 1) {
        // Move to next sub-question
        setCurrentSubQuestionIndex(currentSubQuestionIndex + 1)
      } else {
        // Finished all sub-questions, go back to main questions
        setIsInSubQuestion(false)
        setCurrentSubQuestions([])
        setCurrentSubQuestionIndex(0)
        setSubQuestionAnswers([])
        
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
        } else {
          handleQuizComplete()
        }
      }
    } else {
      // Record main question answer
      const currentQ = questions[currentQuestion]
      const userAnswer = selectedAnswers[currentQuestion]
      const isCorrect = userAnswer === currentQ.correct_answer
      
      setAllAnsweredQuestions(prev => [...prev, {
        question: currentQ,
        userAnswer,
        isCorrect,
        isSubQuestion: false
      }])
      setTotalQuestionsAnswered(prev => prev + 1)
      
      // Main question flow
      setShowExplanation(false)
      
      // Check if there are sub-questions to show based on the selected answer
      const selectedAnswer = selectedAnswers[currentQuestion]
      
      if (currentQ.sub_questions && currentQ.sub_questions.length > 0) {
        // Filter sub-questions that match the selected answer
        const triggeredSubQuestions = currentQ.sub_questions.filter(
          sq => sq.trigger_answer_index === selectedAnswer
        )
        
        if (triggeredSubQuestions.length > 0) {
          // Set up sub-questions
          setCurrentSubQuestions(triggeredSubQuestions)
          setSubQuestionAnswers(new Array(triggeredSubQuestions.length).fill(-1))
          setCurrentSubQuestionIndex(0)
          setIsInSubQuestion(true)
          return // Don't proceed to next main question yet
        }
      }
      
      // No sub-questions triggered, proceed to next main question
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        handleQuizComplete()
      }
    }
  }

  const handleQuizComplete = async () => {
    if (!user) return

    const finalScore = allAnsweredQuestions.reduce((total, answeredQ) => {
      return total + (answeredQ.isCorrect ? 1 : 0)
    }, 0)
    
    setScore(finalScore)

    try {
      // Save quiz result with enhanced data including sub-questions
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id,
          questions: {
            base_questions: questions,
            all_answered: allAnsweredQuestions
          } as any,
          user_answers: {
            main_answers: selectedAnswers,
            all_answered: allAnsweredQuestions.map(q => q.userAnswer)
          } as any,
          score: finalScore,
          total_questions: totalQuestionsAnswered,
          quiz_type: 'daily'
        })

      if (error) throw error

      toast({
        title: 'Quiz Completed!',
        description: `You scored ${finalScore} out of ${totalQuestionsAnswered} questions (including sub-questions)`,
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
    onComplete?.(finalScore, totalQuestionsAnswered)
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

  // Determine current question and answer state
  const currentQ = isInSubQuestion 
    ? currentSubQuestions[currentSubQuestionIndex] 
    : questions[currentQuestion]
  
  const userAnswer = isInSubQuestion 
    ? subQuestionAnswers[currentSubQuestionIndex] 
    : selectedAnswers[currentQuestion]
  
  const isCorrect = userAnswer === currentQ.correct_answer
  const showExplanationState = isInSubQuestion ? showSubExplanation : showExplanation
  
  // Calculate progress including sub-questions
  const totalBaseQuestions = questions.length
  const progressBase = currentQuestion / totalBaseQuestions
  const subQuestionProgress = isInSubQuestion 
    ? (currentSubQuestionIndex + 1) / currentSubQuestions.length * (1 / totalBaseQuestions)
    : 0
  const progress = (progressBase + subQuestionProgress) * 100

  if (quizCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🎉 Quiz Completed!</CardTitle>
          <CardDescription>Great job on completing today's quiz</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary">
            {score}/{totalQuestionsAnswered}
          </div>
          <div className="text-xl">
            Score: {Math.round((score / totalQuestionsAnswered) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">
            {questions.length} base questions, {totalQuestionsAnswered - questions.length} sub-questions
          </div>
          
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < Math.round((score / totalQuestionsAnswered) * 5)
                    ? 'bg-yellow-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {allAnsweredQuestions.map((answeredQ, index) => (
              <div key={`${answeredQ.question.id}-${index}`} className="border rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium flex-1">{answeredQ.question.question}</h4>
                  {answeredQ.isSubQuestion && (
                    <Badge variant="outline" className="text-xs">Sub-question</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {answeredQ.question.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      className={`p-2 rounded ${
                        optionIndex === answeredQ.question.correct_answer
                          ? 'bg-green-100 text-green-800'
                          : answeredQ.userAnswer === optionIndex
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-50'
                      }`}
                    >
                      {option}
                      {optionIndex === answeredQ.question.correct_answer && (
                        <CheckCircle className="inline h-4 w-4 ml-2" />
                      )}
                      {answeredQ.userAnswer === optionIndex && optionIndex !== answeredQ.question.correct_answer && (
                        <XCircle className="inline h-4 w-4 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
                {answeredQ.question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">{answeredQ.question.explanation}</p>
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
                {isInSubQuestion ? (
                  <>Sub-question {currentSubQuestionIndex + 1} of {currentSubQuestions.length} (Question {currentQuestion + 1})</>
                ) : (
                  <>Question {currentQuestion + 1} of {questions.length}</>
                )}
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentQ.subject}</Badge>
              {isInSubQuestion && (
                <Badge variant="outline" className="text-xs">Sub-question</Badge>
              )}
            </div>
            <Badge variant={currentQ.difficulty === 'easy' ? 'default' : currentQ.difficulty === 'medium' ? 'secondary' : 'destructive'}>
              {currentQ.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showExplanationState ? (
            <>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={userAnswer === index ? "default" : "outline"}
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
                {isInSubQuestion 
                  ? (currentSubQuestionIndex === currentSubQuestions.length - 1 ? 'Finish Sub-questions' : 'Next Sub-question')
                  : (currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question')
                }
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
                        : index === userAnswer && index !== currentQ.correct_answer
                        ? 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                        : 'bg-muted/30'
                    }`}
                  >
                    {index === currentQ.correct_answer ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : index === userAnswer && index !== currentQ.correct_answer ? (
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
                {isInSubQuestion 
                  ? (currentSubQuestionIndex === currentSubQuestions.length - 1 
                      ? (currentQuestion === questions.length - 1 ? 'View Results' : 'Continue to Next Question')
                      : 'Continue')
                  : (currentQuestion === questions.length - 1 ? 'View Results' : 'Continue')
                }
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}