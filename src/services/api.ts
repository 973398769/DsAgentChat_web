import { ChatMessage } from '../types'
import axios from './axios'
import router from '../router'
import { sha256 } from '../utils/crypto'

// Move interface definition outside the class
interface StreamChunk {
  type?: 'think' | 'response'
  content: string
}

export class ApiService {
  private static baseUrl = import.meta.env.VITE_API_BASE_URL

  // Handle chat message stream
  static async handleChatStream(reader: ReadableStreamDefaultReader<Uint8Array>, 
                              onChunk: (chunk: StreamChunk) => void) {
    const decoder = new TextDecoder()
    let thinkContent = ''
    let responseContent = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6) // Remove 'data: ' prefix
            if (content === '[DONE]') continue
            
            // Check whether this is the thinking process
            if (content.includes('<think>')) {
              thinkContent = content.replace('<think>', '').replace('</think>', '')
              onChunk({ type: 'think', content: thinkContent })
            } else {
              responseContent += content
              onChunk({ type: 'response', content: responseContent })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error)
      throw error
    }
  }

  // Chat API
  static async chat(messages: ChatMessage[]) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.body?.getReader()
  }

  // Reasoning API
  static async reason(messages: ChatMessage[]) {
    const response = await fetch(`${this.baseUrl}/reason`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.body?.getReader()
  }

  // Search API
  static async search(messages: ChatMessage[]) {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.body?.getReader()
  }
}

const API_URL = ''  // Base URL is already set in the axios instance

export interface UserCreate {
  username: string
  email: string
  password: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
}

export const AuthService = {
  async register(data: UserCreate): Promise<Token> {
    const hashedPassword = await sha256(data.password)
    const response = await axios.post('/api/register', {
      username: data.username,
      email: data.email,
      password: hashedPassword
    })
    return response.data
  },

  async login(data: UserLogin): Promise<Token> {
    const hashedPassword = await sha256(data.password)
    const response = await axios.post('/api/token', {
      email: data.email,
      password: hashedPassword
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  async logout() {
    localStorage.removeItem('token')
    router.push('/login')
  },

  // Verify whether the token is valid
  async validateToken() {
    try {
      await axios.get('/api/validate-token')
      return true
    } catch {
      return false
    }
  },

  async getUserInfo() {
    const response = await axios.get('/api/users/me')
    return response.data
  }
} 