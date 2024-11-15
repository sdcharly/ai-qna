export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'student'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'student'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'student'
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          content_type: string
          size: number
          user_id: string
          created_at: string
          processed: boolean
        }
        Insert: {
          id?: string
          name: string
          content_type: string
          size: number
          user_id: string
          created_at?: string
          processed?: boolean
        }
        Update: {
          id?: string
          name?: string
          content_type?: string
          size?: number
          user_id?: string
          created_at?: string
          processed?: boolean
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          content: string
          embedding: number[]
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          embedding: number[]
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          embedding?: number[]
          metadata?: Json
          created_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string
          document_id: string
          created_by: string
          created_at: string
          settings: Json
        }
        Insert: {
          id?: string
          title: string
          description: string
          document_id: string
          created_by: string
          created_at?: string
          settings?: Json
        }
        Update: {
          id?: string
          title?: string
          description?: string
          document_id?: string
          created_by?: string
          created_at?: string
          settings?: Json
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question: string
          options: string[]
          correct_answer: number
          explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question: string
          options: string[]
          correct_answer: number
          explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question?: string
          options?: string[]
          correct_answer?: number
          explanation?: string
          created_at?: string
        }
      }
    }
  }
}
