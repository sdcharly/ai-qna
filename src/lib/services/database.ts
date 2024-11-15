import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { env } from '@/lib/env';

const supabase = createClient<Database>(
  env.getClientEnv().NEXT_PUBLIC_SUPABASE_URL,
  env.getClientEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabase;

export class DatabaseService {
  // User operations
  async createUser(email: string, role: 'admin' | 'student' = 'student') {
    return await supabase
      .from('users')
      .insert({ email, role })
      .select()
      .single();
  }

  async getUserByEmail(email: string) {
    return await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();
  }

  // Document operations
  async createDocument(data: Database['public']['Tables']['documents']['Insert']) {
    return await supabase
      .from('documents')
      .insert(data)
      .select()
      .single();
  }

  async getDocumentById(id: string) {
    return await supabase
      .from('documents')
      .select(`
        *,
        document_chunks (
          id,
          content,
          metadata
        )
      `)
      .eq('id', id)
      .single();
  }

  async getUserDocuments(userId: string) {
    return await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  // Document chunks operations
  async createDocumentChunk(data: Database['public']['Tables']['document_chunks']['Insert']) {
    return await supabase
      .from('document_chunks')
      .insert(data)
      .select()
      .single();
  }

  async searchDocumentChunks(documentId: string, query: number[], similarityThreshold = 0.7, limit = 5) {
    return await supabase
      .rpc('match_document_chunks', {
        document_id: documentId,
        query_embedding: query,
        similarity_threshold: similarityThreshold,
        match_count: limit,
      });
  }

  // Quiz operations
  async createQuiz(data: Database['public']['Tables']['quizzes']['Insert']) {
    return await supabase
      .from('quizzes')
      .insert(data)
      .select()
      .single();
  }

  async getQuizById(id: string) {
    return await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions (
          id,
          question,
          options,
          correct_answer,
          explanation
        )
      `)
      .eq('id', id)
      .single();
  }

  async getUserQuizzes(userId: string) {
    return await supabase
      .from('quizzes')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
  }

  // Quiz questions operations
  async createQuizQuestions(questions: Database['public']['Tables']['quiz_questions']['Insert'][]) {
    return await supabase
      .from('quiz_questions')
      .insert(questions)
      .select();
  }

  async updateQuizQuestion(id: string, data: Database['public']['Tables']['quiz_questions']['Update']) {
    return await supabase
      .from('quiz_questions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }
}
