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

async function runAuth() {
  const client = await pool.connect()
  
  try {
    console.log('Enabling auth schema...')

    // Read SQL file
    const sql = fs.readFileSync(path.resolve(__dirname, 'enable-auth.sql'), 'utf8')

    // Begin transaction
    await client.query('BEGIN')

    // Run SQL
    await client.query(sql)

    // Commit transaction
    await client.query('COMMIT')

    console.log('Auth schema enabled successfully!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error enabling auth schema:', error)
  } finally {
    client.release()
  }
}

runAuth()
