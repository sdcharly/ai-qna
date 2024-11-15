import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/services/database'

export const metadata: Metadata = {
  title: 'Create Quiz | AI Quiz App',
  description: 'Create a new quiz from your document',
}

async function getDocument(documentId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const db = new DatabaseService()
  const document = await db.getDocumentById(documentId)
  if (!document.data) redirect('/dashboard')

  return document.data
}

export default async function CreateQuizPage({
  searchParams,
}: {
  searchParams: { documentId: string }
}) {
  const document = await getDocument(searchParams.documentId)

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
          <CardDescription>
            Configure your quiz settings and generate questions from your document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/quizzes" method="POST" className="space-y-6">
            <input type="hidden" name="documentId" value={document.id} />
            
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Enter quiz description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <div className="pt-2">
                <Slider
                  name="questionCount"
                  defaultValue={[5]}
                  min={1}
                  max={20}
                  step={1}
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <div className="flex gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <label
                    key={level}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      defaultChecked={level === 'medium'}
                      className="form-radio"
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                Generate Quiz
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
