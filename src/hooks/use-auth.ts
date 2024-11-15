import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth/auth-service'
import { type User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

const authService = new AuthService()

export type Profile = {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial session check
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { data: { user }, error } = await authService.getUser()
      if (error) throw error

      setUser(user)
      if (user) {
        await loadProfile(user.id)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(profile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  async function signOut() {
    try {
      const { error } = await authService.signOut()
      if (error) throw error
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isAdmin = profile?.role === 'admin'

  return {
    user,
    profile,
    loading,
    isAdmin,
    signOut
  }
}
