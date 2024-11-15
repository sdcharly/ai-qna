'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get('next') || '/dashboard'
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error) {
      router.push(`/auth/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (message) {
      router.push(`/auth/login?message=${encodeURIComponent(message)}`)
      return
    }

    router.push(next)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
