import { supabase } from '@/lib/supabase/client'
import { type User, type Session } from '@supabase/supabase-js'

export type AuthError = {
  message: string
  status?: number
}

export type AuthResponse<T> = {
  data: T | null
  error: AuthError | null
}

export class AuthService {
  async signUp(email: string, password: string): Promise<AuthResponse<{ user: User | null }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return {
        data: { user: data.user },
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign up',
          status: error.status
        }
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse<{ user: User | null, session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        data: {
          user: data.user,
          session: data.session
        },
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign in',
          status: error.status
        }
      }
    }
  }

  async signOut(): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return { data: null, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to sign out',
          status: error.status
        }
      }
    }
  }

  async resetPassword(email: string): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return { data: null, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to send reset password email',
          status: error.status
        }
      }
    }
  }

  async updatePassword(newPassword: string): Promise<AuthResponse<{ user: User | null }>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return {
        data: { user: data.user },
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to update password',
          status: error.status
        }
      }
    }
  }

  async getSession(): Promise<AuthResponse<{ session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      return {
        data: { session: data.session },
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get session',
          status: error.status
        }
      }
    }
  }

  async getUser(): Promise<AuthResponse<{ user: User | null }>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      return {
        data: { user },
        error: null
      }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get user',
          status: error.status
        }
      }
    }
  }
}
