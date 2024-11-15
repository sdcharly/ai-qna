import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUser() {
  try {
    console.log('Creating test user...\n')

    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'test123'

    // Create user with admin API
    console.log('1. Creating user account...')
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })

    if (userError) {
      console.error('Error creating user:', userError)
      return
    }

    console.log('✓ User created successfully')
    console.log('User ID:', userData.user.id)
    console.log('Email:', userData.user.email)

    // Check user profile
    console.log('\n2. Checking user profile...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return
    }

    console.log('✓ Profile created successfully')
    console.log('Profile:', profile)

    console.log('\nTest user credentials:')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)

  } catch (error) {
    console.error('Error:', error)
  }
}

createUser()
