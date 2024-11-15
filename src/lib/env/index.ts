import { serverSchema, clientSchema, type ServerEnv, type ClientEnv } from './schema'

class Environment {
  private static instance: Environment
  private serverEnv: ServerEnv | null = null
  private clientEnv: ClientEnv | null = null

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment()
    }
    return Environment.instance
  }

  public getServerEnv(): ServerEnv {
    if (!this.serverEnv) {
      const parsed = serverSchema.safeParse(process.env)
      
      if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
        throw new Error('Invalid environment variables')
      }
      
      this.serverEnv = parsed.data
    }
    
    return this.serverEnv
  }

  public getClientEnv(): ClientEnv {
    if (!this.clientEnv) {
      const parsed = clientSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      })
      
      if (!parsed.success) {
        console.error('❌ Invalid public environment variables:', parsed.error.flatten().fieldErrors)
        throw new Error('Invalid public environment variables')
      }
      
      this.clientEnv = parsed.data
    }
    
    return this.clientEnv
  }

  // Helper methods for commonly used values
  public isDevelopment(): boolean {
    return this.getServerEnv().NODE_ENV === 'development'
  }

  public isProduction(): boolean {
    return this.getServerEnv().NODE_ENV === 'production'
  }

  public isTest(): boolean {
    return this.getServerEnv().NODE_ENV === 'test'
  }

  public getMaxUploadSize(): number {
    return this.getServerEnv().MAX_UPLOAD_SIZE
  }

  public getAdminEmail(): string {
    return this.getServerEnv().ADMIN_EMAIL
  }

  // Document processing settings
  public getChunkSize(): number {
    return this.getServerEnv().CHUNK_SIZE
  }

  public getChunkOverlap(): number {
    return this.getServerEnv().CHUNK_OVERLAP
  }

  public getVectorSimilarityThreshold(): number {
    return this.getServerEnv().VECTOR_SIMILARITY_THRESHOLD
  }

  public getMaxSearchResults(): number {
    return this.getServerEnv().MAX_SEARCH_RESULTS
  }
}

export const env = Environment.getInstance()

// For client-side usage
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  }
}
