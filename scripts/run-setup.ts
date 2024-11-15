import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

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

async function runSetup() {
  const client = await pool.connect()
  
  try {
    console.log('Setting up Supabase...')

    // Read SQL file
    const sql = fs.readFileSync(path.resolve(__dirname, 'setup-supabase.sql'), 'utf8')

    // Begin transaction
    await client.query('BEGIN')

    // Run SQL
    await client.query(sql)

    // Commit transaction
    await client.query('COMMIT')

    console.log('Setup completed successfully!')
    console.log('\nAdmin credentials:')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error during setup:', error)
  } finally {
    client.release()
  }
}

runSetup()
