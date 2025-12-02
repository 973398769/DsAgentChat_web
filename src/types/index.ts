// 创建类型定义文件
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  isSearching?: boolean
}

export interface ChatHistory {
  id: number
  title: string
  time: Date
  messages: ChatMessage[]
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
  date?: string
  source?: string
  isExpanded?: boolean
} 