import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/services/database'

export const metadata: Metadata = {
  title: 'Quiz Results | AI Quiz App',
  description: 'View your quiz results and explanations',
}

async function getQuizResults(quizId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const db = new DatabaseService()
  const quiz = await db.getQuizById(quizId)
  if (!quiz.data) redirect('/dashboard')

  return quiz.data
}

export default async function QuizResultsPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { score: string }
}) {
  const quiz = await getQuizResults(params.id)
  const score = parseInt(searchParams.score || '0')

  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>
            Review your answers and learn from the explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl font-bold mb-2">
              {score}%
            </div>
            <div className="text-muted-foreground">
              Your Score
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {quiz.quiz_questions?.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {index + 1}
                </CardTitle>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  question.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {question.correct ? 'Correct' : 'Incorrect'}
                </div>
              </div>
              <CardDescription>
                {question.question}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-4 border rounded-lg ${
                      optionIndex === question.correct_answer
                        ? 'border-green-500 bg-green-50'
                        : optionIndex === question.user_answer
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                  >
                    {option}
                    {optionIndex === question.correct_answer && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="font-medium">Explanation:</p>
                <p className="mt-1 text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = `/quiz/${quiz.id}/take`
            }}
          >
            Try Again
          </Button>
          <Button
            onClick={() => {
              window.location.href = '/dashboard'
            }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
