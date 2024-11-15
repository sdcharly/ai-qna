import { LlamaParseClient } from 'llamaparse'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIService } from './openai'
import { DatabaseService } from './database'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

const supabase = createClient(
  env.getClientEnv().NEXT_PUBLIC_SUPABASE_URL,
  env.getClientEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export class DocumentService {
  private openai: OpenAIService
  private db: DatabaseService
  private llamaparse: LlamaParseClient

  constructor() {
    this.openai = new OpenAIService()
    this.db = new DatabaseService()
    this.llamaparse = new LlamaParseClient({
      apiKey: env.getServerEnv().LLAMAPARSE_API_KEY,
    })
  }

  async processDocument(documentId: string) {
    try {
      // Get document from database
      const { data: document } = await this.db.getDocumentById(documentId)
      if (!document) throw new Error('Document not found')

      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(`${document.user_id}/${document.id}/${document.name}`)

      if (downloadError) throw downloadError

      // Parse document content
      const content = await this.parseDocument(fileData, document.content_type)

      // Split content into chunks
      const chunks = await this.splitContent(content)

      // Generate embeddings and store chunks
      await Promise.all(
        chunks.map(async (chunk) => {
          const embedding = await this.openai.generateEmbedding(chunk)
          await this.db.createDocumentChunk({
            document_id: document.id,
            content: chunk,
            embedding,
            metadata: {},
          })
        })
      )

      // Update document status
      await this.db.updateDocument(document.id, { processed: true })

      return true
    } catch (error) {
      console.error('Error processing document:', error)
      throw error
    }
  }

  private async parseDocument(file: Blob, contentType: string): Promise<string> {
    try {
      // For PDF files, use LlamaParse
      if (contentType === 'application/pdf') {
        const result = await this.llamaparse.parse(file)
        return result.text
      }

      // For text files, read directly
      if (contentType === 'text/plain') {
        return await file.text()
      }

      // For DOCX files, use LlamaParse
      if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await this.llamaparse.parse(file)
        return result.text
      }

      throw new Error('Unsupported file type')
    } catch (error) {
      console.error('Error parsing document:', error)
      throw error
    }
  }

  private async splitContent(content: string): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: env.getChunkSize(),
      chunkOverlap: env.getChunkOverlap(),
    })

    return await splitter.splitText(content)
  }

  async searchDocument(documentId: string, query: string) {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.openai.generateEmbedding(query)

      // Search for similar chunks
      const results = await this.db.searchDocumentChunks(
        documentId,
        queryEmbedding,
        env.getVectorSimilarityThreshold(),
        env.getMaxSearchResults()
      )

      return results.data
    } catch (error) {
      console.error('Error searching document:', error)
      throw error
    }
  }
}
