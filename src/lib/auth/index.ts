import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { env } from '@/lib/env'

export const createClient = () => createClientComponentClient()

export type AuthError = {
  message: string
  status: number
}

export async function signInWithGoogle() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${env.getClientEnv().NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClientComponentClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function getCurrentUser() {
  const supabase = createClientComponentClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error)
    throw error
  }

  return session?.user
}

export async function getUserRole() {
  const user = await getCurrentUser()
  return user?.user_metadata.role || 'student'
}
