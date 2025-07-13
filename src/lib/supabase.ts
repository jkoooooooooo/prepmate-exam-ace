import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Question = {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  created_at: string
}

export type QuizResult = {
  id: string
  user_id: string
  questions: Question[]
  user_answers: number[]
  score: number
  total_questions: number
  completed_at: string
  quiz_type: 'daily' | 'subject' | 'mock'
}

export type UserProfile = {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  streak_count: number
  total_score: number
  created_at: string
  updated_at: string
}