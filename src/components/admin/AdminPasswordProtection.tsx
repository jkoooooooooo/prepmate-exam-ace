import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Shield, Eye, EyeOff } from 'lucide-react'

interface AdminPasswordProtectionProps {
  children: React.ReactNode
}

const ADMIN_PASSWORD = 'admin123' // In production, this should come from environment variables

export function AdminPasswordProtection({ children }: AdminPasswordProtectionProps) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // Check if already authenticated in this session
    const isAdminAuth = sessionStorage.getItem('admin-authenticated')
    if (isAdminAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin-authenticated', 'true')
      toast({
        title: "Access Granted",
        description: "Welcome to the Admin Panel"
      })
    } else {
      setAttempts(prev => prev + 1)
      setPassword('')
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: `Incorrect password. Attempts: ${attempts + 1}`
      })
      
      // Lock out after 5 failed attempts
      if (attempts >= 4) {
        toast({
          variant: "destructive",
          title: "Too Many Attempts",
          description: "Please refresh the page and try again"
        })
      }
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin-authenticated')
    setPassword('')
    setAttempts(0)
    toast({
      title: "Logged Out",
      description: "Admin session ended"
    })
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500" />
            <span className="text-lg font-semibold text-green-500">Admin Panel - Authenticated</span>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          <CardDescription>
            Please enter the admin password to access the panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  disabled={attempts >= 5}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={attempts >= 5}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {attempts > 0 && attempts < 5 && (
              <div className="text-sm text-destructive">
                Incorrect password. Attempts: {attempts}/5
              </div>
            )}
            
            {attempts >= 5 && (
              <div className="text-sm text-destructive font-medium">
                Too many failed attempts. Please refresh the page.
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={attempts >= 5 || !password.trim()}
            >
              <Shield className="h-4 w-4 mr-2" />
              Access Admin Panel
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              For demo purposes, the password is: <code className="bg-background px-1 rounded">admin123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}