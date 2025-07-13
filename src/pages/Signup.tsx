import { SignupForm } from '@/components/auth/SignupForm'
import { BookOpen, Target, Trophy } from 'lucide-react'

export default function Signup() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="flex flex-col justify-center px-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">PrepMate</h1>
            <p className="text-xl opacity-90">Your PSC Exam Success Partner</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Daily Practice</h3>
                <p className="opacity-80">Build consistent study habits with daily quizzes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Subject-wise Tests</h3>
                <p className="opacity-80">Master every topic with targeted practice</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Trophy className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Track Progress</h3>
                <p className="opacity-80">Monitor your improvement and stay motivated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-primary mb-2">PrepMate</h1>
            <p className="text-muted-foreground">PSC Exam Success Partner</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}