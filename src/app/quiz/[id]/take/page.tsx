import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/services/database'

export const metadata: Metadata = {
  title: 'Take Quiz | AI Quiz App',
  description: 'Take a quiz and test your knowledge',
}

async function getQuiz(quizId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const db = new DatabaseService()
  const quiz = await db.getQuizById(quizId)
  if (!quiz.data) redirect('/dashboard')

  return quiz.data
}

export default async function TakeQuizPage({
  params,
}: {
  params: { id: string }
}) {
  const quiz = await getQuiz(params.id)

  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-8">
        {quiz.quiz_questions?.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}
              </CardTitle>
              <CardDescription>
                {question.question}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      className="form-radio"
                      data-correct={optionIndex === question.correct_answer}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg hidden answer-explanation">
                <p className="font-medium">Explanation:</p>
                <p className="mt-1 text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="pt-6">
            <Button
              className="w-full"
              onClick={() => {
                // Show score and explanations
                const questions = document.querySelectorAll('input[type="radio"]')
                let score = 0
                let total = 0
                let currentQuestion = ''

                questions.forEach((input) => {
                  const radio = input as HTMLInputElement
                  if (radio.name !== currentQuestion) {
                    currentQuestion = radio.name
                    total++
                  }
                  if (radio.checked && radio.dataset.correct === 'true') {
                    score++
                  }
                })

                // Show all explanations
                document.querySelectorAll('.answer-explanation').forEach((el) => {
                  el.classList.remove('hidden')
                })

                // Show score
                alert(`Your score: ${score}/${total} (${Math.round(score/total * 100)}%)`)
              }}
            >
              Submit Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
