import { cookies } from 'next/headers'
import { getSessionByToken } from '@/lib/db'
import { SessionData, UserSession } from '@/types/session'
import { randomBytes } from 'crypto'

const SESSION_COOKIE = 'session_token'

export async function getSession(): Promise<UserSession> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return createAnonymousSession()
  }

  try {
    const session = await getSessionByToken(token)
    if (!session) {
      return createAnonymousSession()
    }

    return {
      id: session.user_id,
      email: session.email,
      role: session.role,
      isLoggedIn: true
    }
  } catch (error) {
    console.error('Session error:', error)
    return createAnonymousSession()
  }
}

export function createAnonymousSession(): UserSession {
  return {
    id: '',
    email: '',
    role: 'anonymous',
    isLoggedIn: false
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE)
}
