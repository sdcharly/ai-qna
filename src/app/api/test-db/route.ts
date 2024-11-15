import { NextResponse } from 'next/server'
import { pool, query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test basic connection
    const client = await pool.connect()
    await client.query(`SET search_path TO ${process.env.POSTGRES_SCHEMA || 'public'}`)
    
    // Get database version
    const versionResult = await client.query('SELECT version()')
    const version = versionResult.rows[0].version
    
    // Test schema access
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1
    `, [process.env.POSTGRES_SCHEMA || 'public'])
    
    const tables = tablesResult.rows.map(row => row.table_name)
    
    client.release()

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      version,
      tables,
      schema: process.env.POSTGRES_SCHEMA || 'public'
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
