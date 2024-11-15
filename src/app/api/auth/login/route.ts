import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user by email
    const users = await query<{
      id: string
      email: string
      password_hash: string
      role: string
    }>(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    )

    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      )
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex')

    // Create session
    await query(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, token]
    )

    // Set session cookie
    cookies().set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Return user info (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
