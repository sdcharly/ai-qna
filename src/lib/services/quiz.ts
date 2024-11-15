import { DatabaseService } from './database'
import { OpenAIService } from './openai'

export interface QuizAttempt {
  quizId: string
  userId: string
  score: number
  answers: {
    questionId: string
    selectedAnswer: number
    correct: boolean
  }[]
  timeTaken: number
}

export class QuizService {
  private db: DatabaseService
  private openai: OpenAIService

  constructor() {
    this.db = new DatabaseService()
    this.openai = new OpenAIService()
  }

  async createQuiz(documentId: string, settings: any) {
    try {
      // Get document content
      const { data: document } = await this.db.getDocumentById(documentId)
      if (!document) throw new Error('Document not found')

      // Generate quiz title if not provided
      if (!settings.title) {
        settings.title = await this.openai.generateQuizTitle(document)
      }

      // Create quiz
      const { data: quiz } = await this.db.createQuiz({
        title: settings.title,
        description: settings.description,
        document_id: documentId,
        created_by: settings.userId,
        settings: settings,
      })

      if (!quiz) throw new Error('Failed to create quiz')

      // Generate questions
      const questions = await this.openai.generateQuestions(document, settings)

      // Save questions
      await this.db.createQuizQuestions(
        questions.map(q => ({
          quiz_id: quiz.id,
          ...q
        }))
      )

      return quiz
    } catch (error) {
      console.error('Error creating quiz:', error)
      throw error
    }
  }

  async recordAttempt(attempt: QuizAttempt) {
    try {
      // Get quiz
      const { data: quiz } = await this.db.getQuizById(attempt.quizId)
      if (!quiz) throw new Error('Quiz not found')

      // Calculate statistics
      const totalQuestions = quiz.quiz_questions?.length || 0
      const correctAnswers = attempt.answers.filter(a => a.correct).length
      const score = (correctAnswers / totalQuestions) * 100

      // Update quiz statistics
      const attempts = (quiz.attempts || 0) + 1
      const totalScore = ((quiz.average_score || 0) * (attempts - 1) + score) / attempts
      const bestScore = Math.max(quiz.best_score || 0, score)

      // Save attempt
      await this.db.createQuizAttempt({
        quiz_id: attempt.quizId,
        user_id: attempt.userId,
        score,
        answers: attempt.answers,
        time_taken: attempt.timeTaken,
      })

      // Update quiz
      await this.db.updateQuiz(attempt.quizId, {
        attempts,
        average_score: totalScore,
        best_score: bestScore,
      })

      return {
        score,
        totalQuestions,
        correctAnswers,
        timeTaken: attempt.timeTaken,
      }
    } catch (error) {
      console.error('Error recording attempt:', error)
      throw error
    }
  }

  async getQuizStatistics(quizId: string) {
    try {
      const { data: quiz } = await this.db.getQuizById(quizId)
      if (!quiz) throw new Error('Quiz not found')

      const attempts = await this.db.getQuizAttempts(quizId)

      return {
        totalAttempts: quiz.attempts || 0,
        averageScore: quiz.average_score || 0,
        bestScore: quiz.best_score || 0,
        recentAttempts: attempts.data || [],
      }
    } catch (error) {
      console.error('Error getting quiz statistics:', error)
      throw error
    }
  }

  async getUserProgress(userId: string) {
    try {
      const quizzes = await this.db.getUserQuizzes(userId)
      const attempts = await this.db.getUserAttempts(userId)

      return {
        totalQuizzes: quizzes.data?.length || 0,
        completedQuizzes: new Set(attempts.data?.map(a => a.quiz_id)).size,
        totalAttempts: attempts.data?.length || 0,
        averageScore: attempts.data?.reduce((acc, a) => acc + a.score, 0) / (attempts.data?.length || 1),
        recentAttempts: attempts.data || [],
      }
    } catch (error) {
      console.error('Error getting user progress:', error)
      throw error
    }
  }
}
