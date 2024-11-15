import OpenAI from 'openai'
import { ChatCompletionCreateParams } from 'openai/resources/chat'
import { env } from '@/lib/env'

const openai = new OpenAI({
  apiKey: env.getServerEnv().OPENAI_API_KEY,
})

export class OpenAIService {
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: env.getServerEnv().OPENAI_EMBEDDING_MODEL,
      input: text.replace(/\n/g, ' '),
    })

    return response.data[0].embedding
  }

  async generateQuestions(document: any, settings: any) {
    const systemPrompt = `You are an expert quiz generator. Generate questions based on the provided document content.
Follow these rules:
1. Each question should be multiple choice with 4 options
2. Only one option should be correct
3. Questions should test understanding, not just memorization
4. Include a brief explanation for the correct answer
5. Questions should be diverse and cover different aspects of the content
6. Difficulty level should match the specified settings`

    const userPrompt = `Generate ${settings.questionCount || 5} questions based on this content:
${document.content}

Difficulty level: ${settings.difficulty || 'medium'}
Focus areas: ${settings.focusAreas?.join(', ') || 'general understanding'}

Return the questions in this JSON format:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer": number (0-3),
      "explanation": "string"
    }
  ]
}`

    const messages: ChatCompletionCreateParams.Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const response = await openai.chat.completions.create({
      model: env.getServerEnv().OPENAI_MODEL,
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content!)
    return result.questions
  }

  async generateQuizTitle(document: any): Promise<string> {
    const response = await openai.chat.completions.create({
      model: env.getServerEnv().OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Generate a concise but descriptive title for a quiz based on the document content.'
        },
        {
          role: 'user',
          content: document.content
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    })

    return response.choices[0].message.content || 'Quiz'
  }
}
