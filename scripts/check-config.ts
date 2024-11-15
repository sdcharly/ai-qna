import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Create PostgreSQL client
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '6543'),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkConfig() {
  const client = await pool.connect()
  
  try {
    console.log('Checking Supabase configuration...\n')

    // Check database connection
    console.log('1. Database connection:')
    await client.query('SELECT NOW()')
    console.log('✓ Connected to database\n')

    // Check schemas
    console.log('2. Database schemas:')
    const { rows: schemas } = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('auth', 'public')
    `)
    console.log('Schemas found:', schemas.map(s => s.schema_name).join(', '), '\n')

    // Check auth tables
    console.log('3. Auth tables:')
    const { rows: authTables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auth'
    `)
    console.log('Auth tables found:', authTables.map(t => t.table_name).join(', '), '\n')

    // Check public tables
    console.log('4. Public tables:')
    const { rows: publicTables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    console.log('Public tables found:', publicTables.map(t => t.table_name).join(', '), '\n')

    // Check auth.users table
    console.log('5. Auth users:')
    const { rows: users } = await client.query(`
      SELECT id, email, role, is_super_admin 
      FROM auth.users
    `)
    console.log('Users found:', users.length)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})${user.is_super_admin ? ' [admin]' : ''}`)
    })
    console.log()

    // Check public.profiles table
    console.log('6. User profiles:')
    const { rows: profiles } = await client.query(`
      SELECT id, email, role 
      FROM public.profiles
    `)
    console.log('Profiles found:', profiles.length)
    profiles.forEach(profile => {
      console.log(`- ${profile.email} (${profile.role})`)
    })

  } catch (error) {
    console.error('Error checking configuration:', error)
  } finally {
    client.release()
  }
}

checkConfig()
