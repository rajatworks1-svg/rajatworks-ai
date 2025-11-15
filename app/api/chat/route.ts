import { cookies } from 'next/headers'

import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { Model } from '@/lib/types/models'
import { isProviderEnabled } from '@/lib/utils/registry'

export const maxDuration = 30

// 1. CRITICAL CHANGE: DEFAULT MODEL ko LocalAI ki taraf point karna
// Yeh LocalAI, OpenAI ke roop mein kaam karega, isliye hum isko 'openai' providerId hi denge.
// Lekin model ka naam aapke naye LocalAI model se match karega.
const DEFAULT_MODEL: Model = {
  // Model ID ab LOCALAI_MODEL_NAME se aayega (.env.local se)
  id: process.env.LOCALAI_MODEL_NAME || 'Llama-3-8B-GGUF', 
  name: 'Veena Local LLM', // Naya naam
  provider: 'LocalAI', // Naya provider name
  providerId: 'openai', // LocalAI, OpenAI ke API ko imitate karta hai, isliye hum yahi rakhenge.
  enabled: true,
  toolCallType: 'native'
}

export async function POST(req: Request) {
  try {
    const { messages, id: chatId } = await req.json()
    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')
    const userId = await getCurrentUserId()

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const cookieStore = await cookies()
    const modelJson = cookieStore.get('selectedModel')?.value
    const searchMode = cookieStore.get('search-mode')?.value === 'true'

    let selectedModel = DEFAULT_MODEL

    if (modelJson) {
      try {
        // Agar user ne koi dusra model select kiya hai, toh woh use hoga
        selectedModel = JSON.parse(modelJson) as Model
      } catch (e) {
        console.error('Failed to parse selected model:', e)
      }
    }
    
    if (
      !isProviderEnabled(selectedModel.providerId) ||
      selectedModel.enabled === false
    ) {
      // Hum is response ko change kar sakte hain agar LocalAI fail ho toh
      return new Response(
        `Selected provider is not enabled ${selectedModel.providerId}`,
        {
          status: 404,
          statusText: 'Not Found'
        }
      )
    }

    const supportsToolCalling = selectedModel.toolCallType === 'native'
    
    return supportsToolCalling
      ? createToolCallingStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode,
          userId
        })
      : createManualToolStreamResponse({
          messages,
          model: selectedModel,
          chatId,
          searchMode,
          userId
        })
  } catch (error) {
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}
