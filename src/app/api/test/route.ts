import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection
    const quizzes = await query(`
      SELECT 
        q.*,
        array_agg(jsonb_build_object(
          'id', qu.id,
          'question', qu.question,
          'options', qu.options,
          'difficulty', qu.difficulty
        )) as questions
      FROM quizzes q
      LEFT JOIN questions qu ON qu.quiz_id = q.id
      WHERE q.status = 'published'
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `)

    // Get user count
    const { rows: [{ count: userCount }] } = await query(
      'SELECT COUNT(*) FROM users'
    )

    // Get question count
    const { rows: [{ count: questionCount }] } = await query(
      'SELECT COUNT(*) FROM questions'
    )

    return NextResponse.json({
      status: 'success',
      data: {
        quizzes,
        stats: {
          quizCount: quizzes.length,
          userCount,
          questionCount
        }
      }
    })

  } catch (error) {
    console.error('Test route error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Test failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
