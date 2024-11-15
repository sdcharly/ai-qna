import { Pool, PoolClient } from 'pg'
import { SessionData } from '@/types/session'

// Database configuration
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '6543'),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for Supabase's self-signed certificate
  },
  application_name: 'quiz-app'
})

// Test the connection
pool.on('connect', (client) => {
  // Set the search path to use the correct schema
  client.query(`SET search_path TO ${process.env.POSTGRES_SCHEMA || 'public'}`)
  console.log('Database connected')
})

pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

// Helper to get a client from the pool
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect()
  await client.query(`SET search_path TO ${process.env.POSTGRES_SCHEMA || 'public'}`)
  return client
}

// Helper to run a query with automatic client release
export async function query<T = any>(
  queryText: string,
  params?: any[]
): Promise<T[]> {
  const client = await getClient()
  try {
    const result = await client.query(queryText, params)
    return result.rows
  } finally {
    client.release()
  }
}

// Session-related queries
export async function getUserById(userId: string) {
  return await query<{
    id: string
    email: string
    role: string
  }>(
    'SELECT id, email, role FROM users WHERE id = $1',
    [userId]
  ).then(rows => rows[0])
}

export async function createSession(userId: string, token: string) {
  return await query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\') RETURNING *',
    [userId, token]
  )
}

export async function getSessionByToken(token: string): Promise<SessionData | null> {
  const sessions = await query<SessionData>(
    `SELECT s.*, u.email, u.role 
     FROM sessions s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  )
  return sessions[0] || null
}

export async function deleteSession(token: string) {
  return await query('DELETE FROM sessions WHERE token = $1', [token])
}

// User management queries
export async function createUser(email: string, hashedPassword: string, role: string = 'user') {
  return await query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, hashedPassword, role]
  )
}

export async function getUserByEmail(email: string) {
  return await query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  ).then(rows => rows[0])
}

// Quiz-related queries
export async function getPublicQuizzes() {
  return await query(
    'SELECT * FROM quizzes WHERE status = \'published\' ORDER BY created_at DESC'
  )
}

export async function getQuizById(quizId: string) {
  return await query(
    'SELECT * FROM quizzes WHERE id = $1',
    [quizId]
  ).then(rows => rows[0])
}

export async function getQuizQuestions(quizId: string) {
  return await query(
    'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY created_at',
    [quizId]
  )
}

// Export pool for direct access if needed
export { pool }
