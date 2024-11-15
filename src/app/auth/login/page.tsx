'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { AuthService } from '@/lib/auth/auth-service'

const authService = new AuthService()

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [message, setMessage] = useState<string | null>(searchParams.get('message'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)
      setMessage(null)
      
      if (showResetPassword) {
        const { error } = await authService.resetPassword(email)
        if (error) throw error
        setMessage('Please check your email for the reset password link.')
        return
      }

      if (isSignUp) {
        const { error } = await authService.signUp(email, password)
        if (error) throw error
        setMessage('Please check your email for the confirmation link.')
      } else {
        const { error } = await authService.signIn(email, password)
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Authentication error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {showResetPassword
              ? 'Reset Password'
              : isSignUp
              ? 'Create an Account'
              : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {showResetPassword
              ? 'Enter your email to reset your password'
              : isSignUp
              ? 'Create your account to get started'
              : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {!showResetPassword && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 text-sm text-green-500 bg-green-100 border border-green-200 rounded">
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? 'Please wait...'
                : showResetPassword
                ? 'Send Reset Link'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-2">
              {!showResetPassword && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError(null)
                    setMessage(null)
                  }}
                >
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowResetPassword(!showResetPassword)
                  setError(null)
                  setMessage(null)
                }}
              >
                {showResetPassword ? 'Back to sign in' : 'Forgot your password?'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
