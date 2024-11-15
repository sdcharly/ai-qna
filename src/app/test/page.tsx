'use client'

import { useEffect, useState } from 'react'

interface Quiz {
  id: string
  title: string
  description: string
  difficulty: string
  topics: string[]
  questions: Array<{
    id: string
    question: string
    options: string[]
    difficulty: string
  }>
}

interface Stats {
  quizCount: number
  userCount: number
  questionCount: number
}

export default function TestPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/test')
        const result = await response.json()

        if (result.status === 'success') {
          setQuizzes(result.data.quizzes)
          setStats(result.data.stats)
        } else {
          setError(result.message || 'Failed to fetch data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Database Test Results</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-card rounded shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Quizzes</h3>
            <p className="text-2xl font-bold">{stats?.quizCount}</p>
          </div>
          <div className="p-4 bg-card rounded shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Users</h3>
            <p className="text-2xl font-bold">{stats?.userCount}</p>
          </div>
          <div className="p-4 bg-card rounded shadow">
            <h3 className="font-semibold text-sm text-muted-foreground">Questions</h3>
            <p className="text-2xl font-bold">{stats?.questionCount}</p>
          </div>
        </div>

        {/* Quizzes */}
        <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="p-4 bg-card rounded shadow">
              <h3 className="font-bold text-lg">{quiz.title}</h3>
              <p className="text-muted-foreground mb-2">{quiz.description}</p>
              
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                  {quiz.difficulty}
                </span>
                {quiz.topics.map(topic => (
                  <span key={topic} className="px-2 py-1 bg-secondary/10 text-secondary rounded text-sm">
                    {topic}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Questions ({quiz.questions.length})</h4>
                {quiz.questions.map(q => (
                  <div key={q.id} className="pl-4 border-l-2 border-border">
                    <p className="font-medium">{q.question}</p>
                    <ul className="pl-4 mt-1 space-y-1">
                      {q.options.map((option, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
