import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import { OpenAIService } from '@/lib/services/openai'

const db = new DatabaseService()
const openai = new OpenAIService()

export async function POST(request: Request) {
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
    const { title, description, documentId, settings } = json

    // Create quiz
    const quiz = await db.createQuiz({
      title,
      description,
      document_id: documentId,
      created_by: session.user.id,
      settings,
    })

    if (!quiz.data) {
      return NextResponse.json(
        { error: 'Failed to create quiz' },
        { status: 500 }
      )
    }

    // Get document chunks
    const { data: document } = await db.getDocumentById(documentId)
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Generate questions using OpenAI
    const questions = await openai.generateQuestions(document, settings)

    // Save questions
    const savedQuestions = await db.createQuizQuestions(
      questions.map(q => ({
        quiz_id: quiz.data.id,
        ...q
      }))
    )

    return NextResponse.json({
      ...quiz.data,
      questions: savedQuestions.data
    })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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

    // Get user's quizzes
    const quizzes = await db.getUserQuizzes(session.user.id)
    return NextResponse.json(quizzes.data)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
