import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save, Upload, Edit } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export function AdminPanel() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    subject: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard'
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
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
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to load questions.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      })
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...formData.options]
    updatedOptions[index] = value
    setFormData({
      ...formData,
      options: updatedOptions
    })
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const updatedOptions = formData.options.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        options: updatedOptions,
        correct_answer: formData.correct_answer >= index ? Math.max(0, formData.correct_answer - 1) : formData.correct_answer
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.question.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Question is required'
      })
      return
    }

    if (formData.options.some(opt => !opt.trim())) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'All options must be filled'
      })
      return
    }

    if (!formData.explanation.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Explanation is required'
      })
      return
    }

    if (!formData.subject.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Subject is required'
      })
      return
    }

    try {
      const questionData = {
        question: formData.question,
        options: formData.options,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation,
        subject: formData.subject,
        difficulty: formData.difficulty
      }

      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id)

        if (error) throw error
        toast({ title: "Success", description: "Question updated successfully!" })
      } else {
        const { error } = await supabase
          .from('questions')
          .insert(questionData)

        if (error) throw error
        toast({ title: "Success", description: "Question added successfully!" })
      }

      resetForm()
      fetchQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      toast({
        title: "Error",
        description: "Failed to save question. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      options: question.options,
      correct_answer: question.correct_answer,
      explanation: question.explanation || '',
      subject: question.subject,
      difficulty: question.difficulty
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast({ title: "Success", description: "Question deleted successfully!" })
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setEditingQuestion(null)
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      subject: '',
      difficulty: 'easy' as 'easy' | 'medium' | 'hard'
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add New Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </CardTitle>
          <CardDescription>
            {editingQuestion ? 'Update the question details' : 'Create questions for quizzes and mock exams'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={formData.correct_answer === index}
                      onChange={() => setFormData({ ...formData, correct_answer: index })}
                      className="mt-2"
                    />
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
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
              {formData.options.length < 6 && (
                <Button type="button" variant="outline" onClick={handleAddOption} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
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
                  value={formData.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData({ ...formData, difficulty: value })}
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
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingQuestion ? 'Update Question' : 'Save Question'}
              </Button>
              {editingQuestion && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
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
          <div className="space-y-4 max-h-96 overflow-y-auto">
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
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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