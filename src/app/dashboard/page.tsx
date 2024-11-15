import { Metadata } from 'next'
import { FileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/services/database'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Dashboard | AI Quiz App',
  description: 'Manage your documents and quizzes',
}

async function getDocumentsAndQuizzes() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const db = new DatabaseService()
  const [documents, quizzes] = await Promise.all([
    db.getUserDocuments(user.id),
    db.getUserQuizzes(user.id),
  ])

  return {
    documents: documents.data || [],
    quizzes: quizzes.data || [],
  }
}

export default async function DashboardPage() {
  const { documents, quizzes } = await getDocumentsAndQuizzes()

  return (
    <div className="container py-8">
      <div className="grid gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload a document to generate quizzes from. Supports PDF, TXT, and DOCX files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={async (file) => {
                'use server'
                const formData = new FormData()
                formData.append('file', file)
                await fetch('/api/documents', {
                  method: 'POST',
                  body: formData,
                })
              }}
            />
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Manage your uploaded documents and create quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Navigate to quiz creation
                      window.location.href = `/quiz/create?documentId=${doc.id}`
                    }}
                  >
                    Create Quiz
                  </Button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No documents uploaded yet. Upload a document to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Quizzes</CardTitle>
            <CardDescription>
              View and manage your created quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created on {new Date(quiz.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/quiz/${quiz.id}`
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/quiz/${quiz.id}/take`
                      }}
                    >
                      Take Quiz
                    </Button>
                  </div>
                </div>
              ))}
              {quizzes.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No quizzes created yet. Upload a document and create your first quiz.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
