import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuth() {
  try {
    console.log('Testing authentication...\n')

    // Test admin login
    console.log('1. Testing admin login...')
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })

    if (adminError) {
      console.error('Admin login error:', adminError)
    } else {
      console.log(' Admin login successful')
      console.log('Admin session:', adminData.session?.user.email)
    }

    // Test new user signup
    console.log('\n2. Testing new user signup...')
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'test123'

    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })

    if (signUpError || !signUpData?.user) {
      console.error('Signup error:', signUpError)
    } else {
      console.log(' User created successfully')
      console.log('New user:', signUpData.user.email)

      // Test new user login
      console.log('\n3. Testing new user login...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (signInError) {
        console.error('Login error:', signInError)
      } else {
        console.log(' User login successful')
        console.log('User session:', signInData.session?.user.email)
      }

      // Check user profile
      console.log('\n4. Checking user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
      } else {
        console.log(' User profile found')
        console.log('Profile:', profile)
      }
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testAuth()
