const { z } = require('zod')

const serverSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI Services
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-ada-002'),
  LLAMAPARSE_API_KEY: z.string().min(1),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  ADMIN_EMAIL: z.string().email(),
  MAX_UPLOAD_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB

  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Document Processing
  CHUNK_SIZE: z.coerce.number().default(1000),
  CHUNK_OVERLAP: z.coerce.number().default(200),
  VECTOR_SIMILARITY_THRESHOLD: z.coerce.number().default(0.7),
  MAX_SEARCH_RESULTS: z.coerce.number().default(5),
})

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
})

module.exports = {
  serverSchema,
  clientSchema,
}
