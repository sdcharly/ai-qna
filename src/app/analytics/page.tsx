import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/services/database'

export const metadata: Metadata = {
  title: 'Analytics | AI Quiz App',
  description: 'View your quiz performance analytics',
}

async function getAnalytics() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const db = new DatabaseService()
  const [quizzes, documents] = await Promise.all([
    db.getUserQuizzes(user.id),
    db.getUserDocuments(user.id),
  ])

  return {
    quizzes: quizzes.data || [],
    documents: documents.data || [],
    totalAttempts: quizzes.data?.reduce((acc, quiz) => acc + (quiz.attempts || 0), 0) || 0,
    averageScore: quizzes.data?.reduce((acc, quiz) => acc + (quiz.average_score || 0), 0) / (quizzes.data?.length || 1),
  }
}

export default async function AnalyticsPage() {
  const { quizzes, documents, totalAttempts, averageScore } = await getAnalytics()

  return (
    <div className="container py-8">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.processed).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(averageScore)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
          <CardDescription>
            Your performance across all quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{quiz.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {quiz.attempts || 0} attempts
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${quiz.average_score || 0}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Average Score: {Math.round(quiz.average_score || 0)}%</span>
                  <span>Best Score: {Math.round(quiz.best_score || 0)}%</span>
                </div>
              </div>
            ))}

            {quizzes.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No quiz attempts yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Document Statistics</CardTitle>
          <CardDescription>
            Overview of your processed documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {doc.quiz_count || 0} Quizzes Generated
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {doc.processed ? 'Processed' : 'Not Processed'}
                  </p>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
