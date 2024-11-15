import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/services/database'

export const metadata: Metadata = {
  title: 'View Document | AI Quiz App',
  description: 'View and manage your document',
}

async function getDocument(documentId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const db = new DatabaseService()
  const document = await db.getDocumentById(documentId)
  if (!document.data) redirect('/dashboard')

  return document.data
}

export default async function DocumentPage({
  params,
}: {
  params: { id: string }
}) {
  const document = await getDocument(params.id)

  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{document.name}</CardTitle>
              <CardDescription>
                Uploaded on {new Date(document.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `/quiz/create?documentId=${document.id}`
                }}
              >
                Create Quiz
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await fetch(`/api/documents/${document.id}/process`, {
                    method: 'POST',
                  })
                  window.location.reload()
                }}
                disabled={document.processed}
              >
                {document.processed ? 'Processed' : 'Process Document'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Document Chunks */}
            {document.document_chunks?.map((chunk, index) => (
              <div
                key={chunk.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Chunk {index + 1}</h3>
                  <span className="text-sm text-muted-foreground">
                    {chunk.metadata.page ? `Page ${chunk.metadata.page}` : ''}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{chunk.content}</p>
              </div>
            ))}

            {/* No Chunks Message */}
            {(!document.document_chunks || document.document_chunks.length === 0) && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {document.processed
                    ? 'No content chunks found'
                    : 'Process the document to view its content'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Quizzes</CardTitle>
          <CardDescription>
            Quizzes created from this document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {document.quizzes?.map((quiz) => (
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

            {(!document.quizzes || document.quizzes.length === 0) && (
              <p className="text-center py-8 text-muted-foreground">
                No quizzes generated yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
