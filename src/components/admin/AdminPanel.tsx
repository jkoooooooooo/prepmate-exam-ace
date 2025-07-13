import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save, Upload } from 'lucide-react'

export function AdminPanel() {
  const [questions, setQuestions] = useState([
    {
      id: '1',
      question: 'Who is known as the Father of the Indian Constitution?',
      options: ['Mahatma Gandhi', 'Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel'],
      correct_answer: 1,
      explanation: 'Dr. B.R. Ambedkar is known as the Father of the Indian Constitution.',
      subject: 'Indian Constitution',
      difficulty: 'medium'
    }
  ])

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    subject: '',
    difficulty: 'easy'
  })

  const { toast } = useToast()

  const handleAddOption = () => {
    if (newQuestion.options.length < 6) {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, '']
      })
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index] = value
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    })
  }

  const handleRemoveOption = (index: number) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = newQuestion.options.filter((_, i) => i !== index)
      setNewQuestion({
        ...newQuestion,
        options: updatedOptions,
        correct_answer: newQuestion.correct_answer >= index ? Math.max(0, newQuestion.correct_answer - 1) : newQuestion.correct_answer
      })
    }
  }

  const handleSaveQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Question is required'
      })
      return
    }

    if (newQuestion.options.some(opt => !opt.trim())) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'All options must be filled'
      })
      return
    }

    if (!newQuestion.explanation.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Explanation is required'
      })
      return
    }

    if (!newQuestion.subject.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Subject is required'
      })
      return
    }

    const questionToSave = {
      ...newQuestion,
      id: Date.now().toString()
    }

    setQuestions([...questions, questionToSave])
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      subject: '',
      difficulty: 'easy'
    })

    toast({
      title: 'Success',
      description: 'Question added successfully!'
    })
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
    toast({
      title: 'Question deleted',
      description: 'The question has been removed.'
    })
  }

  const subjects = [
    'General Knowledge',
    'Indian Constitution',
    'Indian History',
    'Geography',
    'Science & Technology',
    'Current Affairs',
    'Mathematics',
    'Reasoning',
    'English Language'
  ]

  return (
    <div className="space-y-6">
      {/* Add New Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Question
          </CardTitle>
          <CardDescription>
            Create questions for quizzes and mock exams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="Enter your question here..."
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={newQuestion.correct_answer === index}
                    onChange={() => setNewQuestion({ ...newQuestion, correct_answer: index })}
                    className="mt-2"
                  />
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                  </div>
                </div>
                {newQuestion.options.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="mt-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {newQuestion.options.length < 6 && (
              <Button variant="outline" onClick={handleAddOption} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={newQuestion.subject}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={newQuestion.difficulty}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              placeholder="Explain the correct answer..."
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              rows={3}
            />
          </div>

          <Button onClick={handleSaveQuestion} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Question
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Question Bank ({questions.length} questions)
          </CardTitle>
          <CardDescription>
            Manage existing questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{question.question}</h4>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{question.subject}</Badge>
                      <Badge variant={question.difficulty === 'easy' ? 'default' : question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {question.options.map((option, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      index === question.correct_answer 
                        ? 'bg-green-100 dark:bg-green-900/20 font-medium' 
                        : 'bg-muted/50'
                    }`}>
                      {index === question.correct_answer && '✓ '}{option}
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground italic">
                  {question.explanation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}