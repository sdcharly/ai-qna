import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')

    if (profileError) {
      return NextResponse.json({ error: 'Profile check failed', details: profileError }, { status: 500 })
    }

    // Check auth users
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      return NextResponse.json({ error: 'User check failed', details: userError }, { status: 500 })
    }

    return NextResponse.json({
      profiles,
      users
    })

  } catch (error) {
    console.error('Check DB error:', error)
    return NextResponse.json({ error: 'Check failed', details: error }, { status: 500 })
  }
}
