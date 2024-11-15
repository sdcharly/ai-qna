import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { QuizService } from '@/lib/services/quiz'

const quizService = new QuizService()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { answers, timeTaken } = json

    // Record attempt
    const result = await quizService.recordAttempt({
      quizId: params.id,
      userId: session.user.id,
      score: 0, // Will be calculated in the service
      answers,
      timeTaken,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error recording quiz attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get quiz statistics
    const statistics = await quizService.getQuizStatistics(params.id)
    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error getting quiz statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
