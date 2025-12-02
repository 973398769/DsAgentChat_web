<template>
  <div class="app-container" :class="userStore.theme">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <span class="logo-text"><span class="logo-highlight">AssistGen</span></span>
          <button class="collapse-btn" @click="toggleSidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L2 8L6 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 添加历史聊天列表 -->
      <div class="chat-history">
        <button class="new-chat-btn" @click="startNewChat">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3.33334V12.6667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12.6667 8L3.33333 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          开启新对话
        </button>
        
        <div class="history-list">
          <div v-for="(chat, index) in chatHistory" 
               :key="chat.id"
               :class="['history-item', { active: index === currentChatIndex }]"
               @click="loadChat(index)">
            <div class="history-content">
              <span class="history-title">{{ chat.title }}</span>
              <span class="history-time">{{ formatTime(chat.time) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部个人信息 -->
      <div class="user-section">
        <div class="user-menu" @click.stop="showUserMenu = !showUserMenu">
          <div class="user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="9" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M17.9691 20C17.81 17.1085 16.9247 15 12 15C7.07527 15 6.18997 17.1085 6.03087 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="user-text">{{ userStore.username }}</span>
        </div>
        
        <!-- 用户菜单 -->
        <div v-if="showUserMenu" class="user-dropdown">
          <div class="menu-item" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M10 11L14 8L10 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M14 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            退出登录
          </div>
        </div>
      </div>
    </div>

    <!-- 添加展开按钮 -->
    <button v-if="isSidebarCollapsed" 
            class="expand-btn" 
            @click="toggleSidebar">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2L14 8L10 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 主聊天区域 -->
    <div class="chat-container">
      <div class="chat-content">
        <!-- 初始状态：欢迎消息和输入框在一起居中 -->
        <div v-if="!messages.length && !uploadedFile" class="initial-state">
          <div class="welcome-message">
            <h2>我是 AssistGen, 很高兴见到你!</h2>
            <p>我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~</p>
          </div>
          <div class="chat-input">
            <div class="input-wrapper">
              <input
                v-model="userInput"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="给 AssistGen 发送消息"
              />
              <div class="button-group">
                <div class="left-buttons">
                  <button 
                    class="tool-btn"
                    :class="{ 'tool-btn-active': isDeepThinking }"
                    @click="toggleDeepThinking"
                  >
                    <div class="icon">🔄</div>
                    深度思考
                  </button>
                  <button 
                    class="tool-btn"
                    :class="{ 'tool-btn-active': isSearching }"
                    @click="toggleSearch"
                  >
                    <div class="icon">🌐</div>
                    {{ isSearching ? '取消搜索' : '联网搜索' }}
                  </button>
                  <button 
                    class="tool-btn"
                    :class="{ 'tool-btn-active': isRagMode }"
                    @click="isRagMode = !isRagMode"
                  >
                    <div class="icon">📚</div>
                    知识库问答
                  </button>
                </div>
                <div class="right-buttons">
                  <button class="tool-btn" @click="$refs.fileInput?.click()">
                    <div class="icon">📎</div>
                  </button>
                  <button 
                    class="send-btn" 
                    :class="{ 'send-btn-active': userInput.trim() }" 
                    :disabled="!userInput.trim()"
                    @click="sendMessage"
                  >
                    <div class="icon">
                      <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M7 16c-.595 0-1.077-.462-1.077-1.032V1.032C5.923.462 6.405 0 7 0s1.077.462 1.077 1.032v13.936C8.077 15.538 7.595 16 7 16z" fill="currentColor"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M.315 7.44a1.002 1.002 0 0 1 0-1.46L6.238.302a1.11 1.11 0 0 1 1.523 0c.421.403.421 1.057 0 1.46L1.838 7.44a1.11 1.11 0 0 1-1.523 0z" fill="currentColor"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.685 7.44a1.11 1.11 0 0 1-1.523 0L6.238 1.762a1.002 1.002 0 0 1 0-1.46 1.11 1.11 0 0 1 1.523 0l5.924 5.678c.42.403.42 1.056 0 1.46z" fill="currentColor"/>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 对话状态或有文件上传时：消息列表在上，输入框在底部 -->
        <div v-else class="chat-state">
          <div class="chat-messages">
            <div v-for="(message, index) in messages" 
                 :key="index"
                 :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
              <div class="message-avatar">
                <!-- 用户头像 -->
                <svg v-if="message.role === 'user'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="12" cy="9" r="3" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M17.9691 20C17.81 17.1085 16.9247 15 12 15C7.07527 15 6.18997 17.1085 6.03087 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <!-- AI头像 -->
                <svg v-else width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="#4b4bff" opacity="0.2"/>
                  <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#4b4bff" stroke-width="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="#4b4bff" opacity="0.2" stroke="#4b4bff" stroke-width="1.5"/>
                </svg>
              </div>
              <div class="message-content" v-html="renderMessage(message)" @click="handleMessageClick(message, $event)"></div>
            </div>
          </div>
          <div class="chat-input-container">
            <!-- 文件上传状态显示 -->
            <div v-if="uploadedFile" class="cefa5c26 d5e44c7a">
              <div class="a4380d7b">
                <div class="cd190a50 e5931f90">
                  <div class="d2d04dae">
                    <div class="ds-icon b3a5d6c1" style="font-size: 32px; width: 32px; height: 32px;">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                           :data-type="getFileType(uploadedFile.type)">
                        <path d="M7 9C7 6.79086 8.79086 5 11 5L18.6383 5C19.1906 5 19.6383 5.44772 19.6383 6V6.92308C19.6383 9.13222 21.4292 10.9231 23.6383 10.9231H24C24.5523 10.9231 25 11.3708 25 11.9231V23C25 25.2091 23.2091 27 21 27H11C8.79086 27 7 25.2091 7 23V9Z"/>
                      </svg>
                    </div>
                    <div class="aea7ca45">
                      <div class="f3a54b52">{{ uploadedFile.name }}</div>
                      <div class="ee357eab">
                        {{ uploadedFile.status === 'uploading' ? '上传中...' : 
                           uploadedFile.status === 'error' ? '上传失败' :
                           `${formatFileSize(uploadedFile.size)}` }}
                      </div>
                    </div>
                    <button class="delete-btn" @click="handleDeleteFile">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 原有的聊天输入框 -->
            <div class="chat-input">
              <div class="input-wrapper">
                <input
                  v-model="userInput"
                  @keyup.enter="sendMessage"
                  type="text"
                  placeholder="给 AssistGen 发送消息"
                />
                <div class="button-group">
                  <div class="left-buttons">
                    <button 
                      class="tool-btn"
                      :class="{ 'tool-btn-active': isDeepThinking }"
                      @click="toggleDeepThinking"
                    > 
                      <div class="icon">🔄</div>
                      深度思考
                    </button>
                    <button 
                      class="tool-btn"
                      :class="{ 'tool-btn-active': isSearching }"
                      @click="toggleSearch"
                    >
                      <div class="icon">🌐</div>
                      {{ isSearching ? '取消搜索' : '联网搜索' }}
                    </button>
                    <button 
                      class="tool-btn"
                      :class="{ 'tool-btn-active': isRagMode }"
                      @click="isRagMode = !isRagMode"
                    >
                      <div class="icon">📚</div>
                      知识库问答
                    </button>
                  </div>
                  <div class="right-buttons">
                    <button class="tool-btn" @click="$refs.fileInput?.click()">
                      <div class="icon">📎</div>
                    </button>
                    <button 
                      class="send-btn" 
                      :class="{ 'send-btn-active': userInput.trim() }" 
                      :disabled="!userInput.trim()"
                      @click="sendMessage"
                    >
                      <div class="icon">
                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M7 16c-.595 0-1.077-.462-1.077-1.032V1.032C5.923.462 6.405 0 7 0s1.077.462 1.077 1.032v13.936C8.077 15.538 7.595 16 7 16z" fill="currentColor"/>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M.315 7.44a1.002 1.002 0 0 1 0-1.46L6.238.302a1.11 1.11 0 0 1 1.523 0c.421.403.421 1.057 0 1.46L1.838 7.44a1.11 1.11 0 0 1-1.523 0z" fill="currentColor"/>
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.685 7.44a1.11 1.11 0 0 1-1.523 0L6.238 1.762a1.002 1.002 0 0 1 0-1.46 1.11 1.11 0 0 1 1.523 0l5.924 5.678c.42.403.42 1.056 0 1.46z" fill="currentColor"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="disclaimer-text">内容由 AI 生成，请仔细甄别</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加搜索结果面板 -->
    <div v-if="showSearchPanel" class="search-panel">
      <div class="search-panel-header">
        <h3>搜索结果</h3>
        <button class="close-btn" @click="showSearchPanel = false">
          <span>×</span>
        </button>
      </div>
      <div class="search-results-list">
        <div v-for="(result, index) in searchResults" 
             :key="index"
             class="search-result-item"
             :class="{ active: result.isExpanded }">
          <div class="result-header" @click="toggleResultExpand(result)">
            <div class="result-source">
              <img :src="getSourceIcon(result.source)" class="source-icon" />
              <span class="source-name">{{ result.source }}</span>
              <span class="result-date">{{ result.date }}</span>
            </div>
            <div class="result-title">{{ result.title }}</div>
          </div>
          <div v-if="result.isExpanded" class="result-content">
            <div class="result-snippet">{{ result.snippet }}</div>
            <a :href="result.url" target="_blank" class="result-link" @click.stop>查看原文</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加搜索结果详情面板 -->
    <div v-if="selectedResult" class="result-detail-panel">
      <div class="detail-header">
        <button class="back-btn" @click="selectedResult = null">
          <span>←</span>
        </button>
        <h3>{{ selectedResult.title }}</h3>
      </div>
      <div class="detail-content">
        <div class="detail-meta">
          <span class="detail-source">{{ selectedResult.source }}</span>
          <span class="detail-date">{{ selectedResult.date }}</span>
        </div>
        <div class="detail-text">{{ selectedResult.snippet }}</div>
        <a :href="selectedResult.url" target="_blank" class="detail-link">查看原文</a>
      </div>
    </div>

    <!-- 在 app-container div 内部的最后添加 -->
    <input 
      type="file" 
      ref="fileInput"
      @change="handleFileUpload"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import { ApiService } from '../services/api'
import { AuthService } from '../services/api'
import { useUserStore } from '../stores/user'

interface StreamResponse {
  content: string
  done: boolean
}

interface ExecutionResponse {
  type: 'conclusion' | 'process' | 'files' | 'cost' | 'error' | 'done'
  content: any
}

interface ExecutionRequest {
  prompt: string
  taskId?: string
}

interface ChatRequest {
  messages: {
    role: string
    content: string
  }[]
}

interface ChatMessage {
  role: string
  content: string
  thinking?: string
  conclusion?: string
  process?: string
  files?: {
    files: string[]
    urls: string[]
  }
  cost?: {
    total: number
    details: Record<string, number>
  }
  hasDetails?: boolean
  showDetails?: boolean
  isSearching?: string
}

interface ChatHistory {
  id: number
  title: string
  time: Date
  messages: ChatMessage[]
}

interface SearchResult {
  title: string
  url: string
  snippet: string
  date: string
  source: string
  isExpanded?: boolean
}

interface SearchResponse {
  type: 'search_results'
  total: number
  query: string
  results: SearchResult[]
  error?: string
}

const userInput = ref('')
const messages = ref<ChatMessage[]>([])
const isSidebarCollapsed = ref(false)
const chatHistory = ref<ChatHistory[]>([])
const currentChatIndex = ref(0)
const currentAgent = ref('openai')
const currentResponse = ref('')
const ws = ref<WebSocket | null>(null)
const isDeepThinking = ref(false)
const thinkStartTime = ref<number | null>(null)
const isSearching = ref(false)
const searchResults = ref<SearchResult[]>([])
const showSearchPanel = ref(false)
const selectedResult = ref<SearchResult | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFileInfo = ref<{
  name: string;
  type: string;
  size: number;
} | null>(null)
const uploadStatus = ref<{
  isUploading: boolean;
  fileName: string;
} | null>(null)
const uploadedFile = ref<{
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
} | null>(null)
const isRagMode = ref(false)
const currentIndexId = ref<string | null>(null)

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
  typographer: true
})

const scrollToBottom = async () => {
  await nextTick()
  const container = document.querySelector('.chat-container')
  if (container) {
    // 使用平滑滚动
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const startNewChat = () => {
  messages.value = []
  currentChatIndex.value = 0
  scrollToBottom()
}

const loadChat = (index: number) => {
  currentChatIndex.value = index
  messages.value = [...chatHistory.value[index].messages]
  scrollToBottom()
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

const renderMessage = (message: ChatMessage) => {
  // 清理内容中的转义字符
  const cleanContent = (text: string) => {
    return text.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
  };

  // 如果是搜索状态的消息，直接返回原始 HTML
  if (message.isSearching) {
    return message.content;
  }

  // 如果包含思考过程
  if (message.content.includes('💭 **思考过程：**')) {
    // 分割内容为思考过程和回复
    const parts = message.content.split('\n\n');
    // console.log(parts);
    // 找到包含思考过程的部分
    const thinkingIndex = parts.findIndex(part => part.includes('💭 **思考过程：**'));
    if (thinkingIndex !== -1) {
      // 思考过程部分
      const thinkingPart = parts[thinkingIndex];
      // 最后一个部分作为回复
      console.log(thinkingPart);
      const responsePart = parts[parts.length - 1];

      // 分别渲染思考过程和回复内容
      // const thinkingHtml = md.render(cleanContent(thinkingPart));
      const thinkingHtml = md.render(cleanContent(thinkingPart))
        .replace(/<blockquote>/g, '')
        .replace(/<\/blockquote>/g, '');
      const responseHtml = md.render(cleanContent(responsePart));
      console.log(thinkingHtml);
      return `
        <div class="message-wrapper">
          <div class="thinking-process">
            <div class="thinking-content">
              <blockquote>
                ${thinkingHtml}
              </blockquote>
            </div>
          </div>
          <div class="message-text">
            ${responseHtml}
          </div>
        </div>
      `;
    }
  }

  // 如果包含搜索加载状态
  if (message.content.includes('search-loading-container')) {
    const modelResponseDiv = message.content.indexOf('<div class="model-response">');
    if (modelResponseDiv !== -1) {
      const searchStatus = message.content.slice(0, modelResponseDiv);
      const response = message.content.slice(modelResponseDiv);
      return searchStatus + md.render(cleanContent(response));
    }
  }
  
  return md.render(cleanContent(message.content));
};

// 修改处理流式响应的函数，在每次内容更新时都滚动
const handleStreamResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, 
                                  onData: (content: string) => void) => {
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const text = decoder.decode(value)
    const lines = text.split('\n')
    
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      
      const content = line.slice(6)
      if (content === '[DONE]') continue

      onData(content)
      // 每次更新内容后滚动
      scrollToBottom()
    }
  }
}

// 处理搜索请求
const handleSearch = async () => {
  if (!userInput.value.trim()) return;
  
  const userQuestion = userInput.value;
  messages.value.push({
    role: 'user',
    content: userQuestion
  });

  userInput.value = '';
  
  // 添加带有搜索状态的消息
  messages.value.push({
    role: 'assistant',
    content: `<div class="search-loading-container">
      <div class="search-loading-text">🔍 正在联网检索...</div>
    </div>
    <div class="model-response"></div>`,
    isSearching: 'true'
  });

  try {
    // 修改为直接传递消息数组
    const reader = await ApiService.search([{
      role: 'user',
      content: userQuestion
    }]);
    
    if (!reader) throw new Error('No reader available');

    let currentContent = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        
        const content = line.slice(6).trim();
        if (!content || content === '[DONE]') continue;
        
        try {
          // 尝试解析为 JSON
          const data = JSON.parse(content);
          if (data.type === 'search_results') {
            // 处理搜索结果
            searchResults.value = data.results.map(result => ({
              ...result,
              date: new Date().toLocaleDateString('zh-CN'),
              source: new URL(result.url).hostname,
              isExpanded: false
            }));
            
            // 更新搜索状态消息
            const lastMessage = messages.value[messages.value.length - 1];
            if (lastMessage && lastMessage.isSearching === 'true') {
              const modelResponseDiv = lastMessage.content.indexOf('<div class="model-response">');
              if (modelResponseDiv !== -1) {
                const beforeResponse = lastMessage.content.slice(0, modelResponseDiv);
                lastMessage.content = beforeResponse.replace(
                  '正在联网检索...',
                  '联网检索完成，点击查看结果'
                ) + lastMessage.content.slice(modelResponseDiv);
              }
            }
            continue;
          }
        } catch (e) {
          // 不是 JSON，按普通内容处理
        }

        // 处理普通文本内容
        const cleanContent = content.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
        currentContent += cleanContent;

        // 更新消息内容
        const lastMessage = messages.value[messages.value.length - 1];
        const modelResponseDiv = lastMessage.content.indexOf('<div class="model-response">');
        
        if (modelResponseDiv !== -1) {
          // 如果存在搜索结果按钮，将新内容追加到 model-response div 中
          const beforeResponse = lastMessage.content.slice(0, modelResponseDiv + '<div class="model-response">'.length);
          lastMessage.content = beforeResponse + md.render(currentContent) + '</div>';
        }

        scrollToBottom();
      }
    }

  } catch (error) {
    console.error('Error:', error);
    messages.value[messages.value.length - 1].content = '抱歉，搜索时发生了错误，请稍后重试。';
  }
};

// 处理深度思考请求
const handleReason = async () => {
  if (!userInput.value.trim()) return;
  
  const userQuestion = userInput.value;
  messages.value.push({
    role: 'user',
    content: userQuestion
  });

  userInput.value = '';
  messages.value.push({
    role: 'assistant',
    content: ''
  });

  try {
    const reader = await ApiService.reason(messages.value);
    if (!reader) throw new Error('No reader available');

    let thinkingContent = '';
    let responseContent = '';
    let isInThinkBlock = false;

    await handleStreamResponse(reader, (content) => {
      const cleanContent = content.replace(/^"|"$/g, '');

      if (cleanContent === '<think>') {
        isInThinkBlock = true;
        thinkStartTime.value = Date.now();
        thinkingContent = '\n\n> 💭 **思考过程：** *(思考中...)*\n> ';
        messages.value[messages.value.length - 1].content = thinkingContent;
        return;
      }

      if (cleanContent === '</think>') {
        isInThinkBlock = false;
        const thinkTime = thinkStartTime.value ? 
          ((Date.now() - thinkStartTime.value) / 1000).toFixed(1) : '0.0';
        thinkingContent = thinkingContent.replace('*(思考中...)*', `*(${thinkTime}s)*`);
        thinkStartTime.value = null;
        return;
      }

      if (isInThinkBlock) {
        // thinkingContent = thinkingContent.replace(/\n> .*$/, '\n> ' + cleanContent);
        thinkingContent += cleanContent;
        // console.log(thinkingContent);
      } else {
        responseContent += cleanContent;
      }

      messages.value[messages.value.length - 1].content = 
        `${thinkingContent}\n\n${responseContent}`;
      scrollToBottom();
    });

  } catch (error) {
    console.error('Error:', error);
    messages.value[messages.value.length - 1].content = '抱歉，发生了错误，请稍后重试。';
  }
};

// 处理普通聊天请求
const handleChat = async () => {
  if (!userInput.value.trim()) return;
  
  const userQuestion = userInput.value;
  messages.value.push({
    role: 'user',
    content: userQuestion
  });

  userInput.value = '';
  messages.value.push({
    role: 'assistant',
    content: ''
  });

  try {
    const reader = await ApiService.chat(messages.value);
    if (!reader) throw new Error('No reader available');

    let currentContent = '';

    await handleStreamResponse(reader, (content) => {
      // 移除内容中的引号和处理转义字符
      const cleanContent = content.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
      currentContent += cleanContent;
      messages.value[messages.value.length - 1].content = currentContent;
      scrollToBottom();
    });

  } catch (error) {
    console.error('Error:', error);
    messages.value[messages.value.length - 1].content = '抱歉，发生了错误，请稍后重试。';
  }
};

// 处理 RAG 聊天请求
const handleRagChat = async () => {
  if (!userInput.value.trim()) return
  const userQuestion = userInput.value

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userQuestion
  })

  // 清空输入
  userInput.value = ''

  // 添加 AI 回复消息
  messages.value.push({
    role: 'assistant',
    content: ''
  })

  try {
    const response = await fetch('http://localhost:8000/rag-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: userQuestion
        }]
      })
    })

    if (!response.ok) throw new Error('请求失败')

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('无法创建流读取器')

    let currentContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        
        const content = line.slice(6).trim()
        if (!content) continue

        // 更新消息内容
        currentContent += content
        const lastMessage = messages.value[messages.value.length - 1]
        lastMessage.content = currentContent
      }

      await scrollToBottom()
    }

    // 更新历史记录
    if (chatHistory.value[currentChatIndex.value]) {
      chatHistory.value[currentChatIndex.value].messages = [...messages.value]
    }

  } catch (err: any) {
    console.error('Error:', err)
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.content = `错误：${err.message}`
  }
}

// 修改 sendMessage 方法，添加 RAG 模式判断
const sendMessage = async () => {
  if (currentIndexId.value) {
    // 如果有 index_id，使用 chat-rag 接口
    await handleChatRag()
  } else {
    if (isRagMode.value) {
      await handleRagChat()
    } else {
      if (isSearching.value) {
        await handleSearch()
      } else if (isDeepThinking.value) {
        await handleReason()
      } else {
        await handleChat()
      }
    }
  }
}

// 修改 handleChatRag 方法
const handleChatRag = async () => {
  if (!userInput.value.trim()) return
  const userQuestion = userInput.value

  messages.value.push({
    role: 'user',
    content: userQuestion
  })

  userInput.value = ''
  messages.value.push({
    role: 'assistant',
    content: ''
  })

  try {
    const response = await fetch('http://localhost:8000/chat-rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: userQuestion
        }],
        index_id: currentIndexId.value
      })
    })

    if (!response.ok) throw new Error('请求失败')

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('无法创建流读取器')

    let currentContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        
        const content = line.slice(6).trim()
        if (!content) continue

        // 移除内容中的引号和处理转义字符
        const cleanContent = content.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
        currentContent += cleanContent
        const lastMessage = messages.value[messages.value.length - 1]
        // 直接设置内容，让 renderMessage 函数处理渲染
        lastMessage.content = currentContent
      }

      await scrollToBottom()
    }

  } catch (err: any) {
    console.error('Error:', err)
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.content = `错误：${err.message}`
  }
}

const selectAgent = (agent: string) => {
  if (agent === 'TwoAgentChat') {
    messages.value = []
    messages.value.push({
      role: 'assistant',
      content: '已切换到 TwoAgentChat 模式。请描述您的任务，我会协助您完成。'
    })
  }
  currentAgent.value = agent
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

const toggleDeepThinking = () => {
  isDeepThinking.value = !isDeepThinking.value;
  if (isDeepThinking.value) {
    // 如果开启深度思考，自动关闭搜索
    isSearching.value = false;
  }
}

const toggleSearch = () => {
  isSearching.value = !isSearching.value
  if (!isSearching.value) {
    // 如果取消搜索，重置状态
    isDeepThinking.value = false
  }
}

// 监听消息变化
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 添加 ResizeObserver 来监听内容高度变化
onMounted(() => {
  const container = document.querySelector('.chat-container')
  if (container) {
    const resizeObserver = new ResizeObserver(() => {
      scrollToBottom()
    })
    
    resizeObserver.observe(container)
    
    // 组件卸载时清理
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }
})

// 添加获取图标的方法
const getSourceIcon = (source: string) => {
  // 这里可以根据不同来源返回不同的图标URL
  return `https://www.google.com/s2/favicons?domain=${source}`
}

// 修改处理搜索结果的逻辑
const handleSearchResults = (results: SearchResult[]) => {
  searchResults.value = results.map(result => ({
    ...result,
    date: new Date().toLocaleDateString('zh-CN'),
    source: new URL(result.url).hostname,
    isExpanded: false
  }));
  
  // 更新搜索状态消息
  const lastMessage = messages.value[messages.value.length - 1];
  if (lastMessage && lastMessage.isSearching === 'true') {
    const modelResponseDiv = lastMessage.content.indexOf('<div class="model-response">');
    if (modelResponseDiv !== -1) {
      const beforeResponse = lastMessage.content.slice(0, modelResponseDiv);
      lastMessage.content = beforeResponse.replace(
        '正在联网检索...',
        '联网检索完成，点击查看结果'
      ) + lastMessage.content.slice(modelResponseDiv);
    }
    lastMessage.isSearching = 'false';
  }
  
  // 不自动显示搜索面板
  showSearchPanel.value = false;
};

// 添加切换展开状态的方法
const toggleResultExpand = (result: SearchResult) => {
  result.isExpanded = !result.isExpanded
}

// 修改消息点击事件处理
const handleMessageClick = (message: ChatMessage, event: MouseEvent) => {
  // 检查点击的元素是否包含搜索完成的文本
  const clickedElement = event.target as HTMLElement;
  const searchContainer = clickedElement.closest('.search-loading-container');
  
  if (searchContainer && searchResults.value.length > 0) {
    showSearchPanel.value = true;
  }
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)
  
  // 设置上传中状态
  uploadedFile.value = {
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'uploading'
  }
  
  try {
    const response = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const result = await response.json()
    
    if (result.status === 'success') {
      // 保存 index_id
      currentIndexId.value = result.index_id
      
      // 更新上传成功状态
      uploadedFile.value = {
        name: result.original_name,
        size: result.size,
        type: result.type,
        status: 'success'
      }
    }
    
  } catch (err: any) {
    console.error('Upload failed:', err)
    if (uploadedFile.value) {
      uploadedFile.value.status = 'error'
    }
    currentIndexId.value = null
  }
  
  input.value = ''
}

// 格式化文件大小的辅助函数
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 添加删除文件的方法
const handleDeleteFile = () => {
  uploadedFile.value = null
  currentIndexId.value = null
}

// 添加获取文件类型的方法
const getFileType = (mimeType: string) => {
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word')) return 'doc'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xls'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt'
  if (mimeType.includes('text')) return 'txt'
  if (mimeType.includes('image')) return 'image'
  return 'default'
}

const handleLogout = () => {
  AuthService.logout()
}

const userStore = useUserStore()
const showUserMenu = ref(false)

// 获取用户信息
onMounted(async () => {
  try {
    const response = await AuthService.getUserInfo()
    userStore.setUserInfo(response)
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
})

// 关闭菜单的点击外部处理
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
/* 添加全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<style scoped>
/* 根容器 */
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #1e1e1e;
}

.app-container.light {
  background-color: #ffffff;
  color: #333333;
}

.app-container.light .sidebar {
  background-color: #f5f5f5;
  border-right-color: #e0e0e0;
}

.app-container.light .chat-input {
  background-color: #f5f5f5;
}

.app-container.light input {
  color: #333333;
}

/* 左侧栏 */
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: #2d2d2d;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 0;
}

/* 右侧聊天区域 */
.chat-container {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a #1e1e1e;
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  overflow-y: visible;
  position: relative;
}

.chat-container::-webkit-scrollbar {
  width: 8px;
  position: absolute;
  right: 0;
}

.chat-container::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.chat-container::-webkit-scrollbar-thumb {
  background-color: #4a4a4a;
  border-radius: 4px;
  border: 2px solid #1e1e1e;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background-color: #666;
}

/* 初始状态样式 */
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin: auto;
  width: 100%;
  max-width: 600px;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

/* 对话状态样式 */
.chat-state {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100%;
  position: relative;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 消息区域样式 */
.chat-messages {
  flex: 1;
  padding-bottom: 280px; /* 增加更多底部padding，确保内容不被遮挡 */
}

.chat-input-container {
  position: fixed;
  bottom: 0;
  left: calc(50% + 130px); /* 考虑侧边栏宽度的一半 (260px / 2 = 130px) */
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  background-color: #1e1e1e;
  padding: 0 20px 20px; /* 修改padding */
  border-top: 1px solid #333;
  z-index: 10;
  transition: left 0.3s ease; /* 添加过渡效果 */
}

/* 当侧边栏收起时的样式 */
.sidebar-collapsed ~ .chat-container .chat-input-container {
  left: 50%; /* 侧边栏收起时回到中间 */
}

.chat-input {
  width: 100%;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.chat-input .input-wrapper {
  max-width: 800px;
}

.disclaimer-text {
  text-align: center;
  color: #666;
  font-size: 12px;
  padding: 4px 0;
}

/* 聊天框样式 */
.center-chat-box {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  max-width: 600px;
}

/* 欢迎消息样式 */
.welcome-message {
  text-align: center;
}

.welcome-message h2 {
  color: #fff;
  font-size: 24px;
  margin: 0;
  font-weight: normal;
}

.welcome-message p {
  color: #666;
  font-size: 13px;
  margin: 0;
  margin-top: 2px;
}

/* 消息样式 */
.message {
  padding: 12px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 用户消息样式 */
.user-message {
  background-color: #1e1e1e;
  flex-direction: row-reverse;
}

/* AI消息样式 */
.assistant-message {
  background: none;
}

/* 头像样式 */
.message-avatar {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  color: #666;
}

/* 消息内容样式 */
.message-content {
  font-size: 14px;
  line-height: 1.6;
  color: #fff;
}

/* 底部个人信息样式 */
.user-section {
  position: relative;
  padding: 8px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  color: #fff;
}

.user-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.arrow-icon {
  transition: transform 0.2s;
}

.user-menu:hover .arrow-icon {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: #2d2d2d;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
  margin: 0 8px 8px;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item:last-child {
  color: #ff4b4b;
}

.menu-item:last-child:hover {
  background: rgba(255, 75, 75, 0.1);
}

.user-avatar {
  width: 24px;
  height: 24px;
  color: #888;
}

.user-text {
  font-size: 14px;
  color: #fff;
}

/* 侧边栏样式 */
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #333;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-highlight {
  background: linear-gradient(90deg, #4b4bff 0%, #6b6bff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.collapse-btn {
  background: none;
  border: none;
  color: #666;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.agents-list {
  padding: 1rem 0;
  overflow-y: auto;
}

.agent-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 0.8rem;
}

.agent-item:hover {
  background-color: #363636;
}

.agent-item.active {
  background-color: #4a4eff33;
}

.agent-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.agent-name {
  font-size: 0.9rem;
  color: #fff;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 16px;
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  background-color: #4b4bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-chat-btn:hover {
  background-color: #3a3aff;
}

.new-chat-btn svg {
  width: 14px;
  height: 14px;
  color: #fff;
  opacity: 1;
}

/* 输入框容器样式 */
.input-wrapper {
  width: 100%;
  background-color: #2d2d2d;
  border-radius: 25px;
  padding: 12px 16px;
}

input {
  width: 100%;
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
  padding: 8px 0;
  margin-bottom: 4px;
}

input::placeholder {
  color: #666;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.left-buttons, .right-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #888;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.tool-btn:hover {
  color: #fff;
  background: rgba(75, 75, 255, 0.1);
}

.tool-btn-active {
  color: #4b4bff !important;
  background: rgba(75, 75, 255, 0.1);
}

.tool-btn-active:hover {
  background: rgba(75, 75, 255, 0.2);
}

.send-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.send-btn-active {
  color: #4b4bff;
}

.send-btn-active:hover {
  color: #3a3aff;
}

.send-btn .icon {
  width: 16px;
  height: 16px;
}

/* 空状态样式调整 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 1rem;
}

.empty-state-content {
  background: none;
  padding: 0;
  box-shadow: none;
  width: 100%;
  max-width: 600px;
}

.empty-state-content h3 {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.empty-state-content p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.empty-state-content .input-wrapper {
  margin-top: 0;
}

/* 工具提示样式 */
.tool-btn .tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4a4a4a;
  color: #fff;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  pointer-events: none;
}

.tool-btn:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.tool-btn .tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #4a4a4a transparent transparent transparent;
}

/* 修改空状态下的输入框样式 */
.empty-state-content .input-wrapper {
  margin-top: 1.5rem;
  width: 100%;
}

/* 修改历史聊天列表样式 */
.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
  border-radius: 0;
}

.history-item:hover {
  background-color: #2d2d2d;
}

.history-item.active {
  background-color: #343541;
  border-left: none;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title {
  color: #ececf1;
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  color: #666;
  font-size: 12px;
}

/* Markdown 样式优化 */
:deep(.message-content) {
  color: #fff;
  font-size: 14px;
  line-height: 1.6;

  h1, h2, h3, h4, h5, h6 {
    color: #fff;
    margin: 1em 0;
  }

  p {
    color: #fff;
    margin: 0.5em 0;
  }

  a {
    text-decoration: none;
    transition: all 0.2s ease;
  }

  a:hover {
    text-decoration: underline;
    opacity: 0.8;
  }

  ul, ol {
    color: #fff;
    margin: 0.5em 0;
    padding-left: 2em;
  }

  li {
    margin: 0.25em 0;
  }

  blockquote {
    margin: 1em 0;
    padding: 1em;
    background: rgba(51, 51, 51, 0.6);
    border-left: 4px solid #4b4bff;
    border-radius: 4px;
    color: #666;
  }

  blockquote strong {
    color: #4b4bff;
  }
}

/* 修改展开按钮样式 */
.expand-btn {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn:hover {
  color: #fff;
}

/* 搜索结果样式 */
.search-result {
  background: rgba(75, 75, 255, 0.05);
  border: 1px solid rgba(75, 75, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  transition: all 0.2s ease;
}

.search-result:hover {
  background: rgba(75, 75, 255, 0.1);
  border-color: rgba(75, 75, 255, 0.2);
}

.search-title {
  color: #4b4bff;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  line-height: 1.4;
}

.search-title:hover {
  text-decoration: underline;
}

.search-snippet {
  color: #ccc;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.search-url {
  color: #666;
  font-size: 12px;
  word-break: break-all;
}

:deep(.message-content) {
  .search-result {
    background: rgba(75, 75, 255, 0.05);
    border: 1px solid rgba(75, 75, 255, 0.1);
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
    transition: all 0.2s ease;
  }

  .search-result:hover {
    background: rgba(75, 75, 255, 0.1);
    border-color: rgba(75, 75, 255, 0.2);
  }

  .search-title {
    color: #4b4bff;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    display: block;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .search-title:hover {
    text-decoration: underline;
  }

  .search-snippet {
    color: #ccc;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .search-url {
    color: #666;
    font-size: 12px;
    word-break: break-all;
  }
}

/* 搜索面板样式 */
.search-panel {
  width: 320px;
  height: 100vh;
  background: #2d2d2d;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
}

.search-panel-header {
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-panel-header h3 {
  color: #fff;
  font-size: 16px;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.close-btn:hover {
  color: #fff;
}

.search-results-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.search-result-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.search-result-item.active {
  background: rgba(75, 75, 255, 0.05);
  border-color: rgba(75, 75, 255, 0.2);
}

.result-header {
  cursor: pointer;
}

.result-source {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.source-name {
  color: #fff;
  font-size: 13px;
}

.result-date {
  color: #666;
  font-size: 12px;
  margin-left: auto;
}

.result-title {
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.result-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.2s ease;
}

.result-snippet {
  color: #ccc;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.result-link {
  display: inline-block;
  color: #4b4bff;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s ease;
}

.result-link:hover {
  text-decoration: underline;
}

/* 搜索结果详情面板 */
.result-detail-panel {
  flex: 1;
  height: 100vh;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.back-btn:hover {
  color: #fff;
}

.detail-header h3 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  line-height: 1.4;
}

.detail-content {
  padding: 24px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-source {
  color: #fff;
  font-size: 14px;
}

.detail-date {
  color: #666;
  font-size: 14px;
}

.detail-text {
  color: #fff;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 24px;
}

.detail-link {
  display: inline-block;
  color: #4b4bff;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid #4b4bff;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.detail-link:hover {
  background: rgba(75, 75, 255, 0.1);
}

/* 更新搜索加载状态样式 */
:deep(.search-loading-container) {
  background: rgba(75, 75, 255, 0.1);
  border: 1px solid rgba(75, 75, 255, 0.3);
  border-radius: 20px;
  padding: 0px 0px;
  margin: 12px 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
  transition: all 0.2s ease;
  width: auto;
}

:deep(.search-loading-container:hover) {
  background: rgba(75, 75, 255, 0.2);
  border-color: rgba(75, 75, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.search-loading-text) {
  color: #4b4bff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  padding: 4px 8px;
}

.thinking-process {
  background: rgba(75, 75, 255, 0.05);
  border: 1px solid rgba(75, 75, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.thinking-header {
  color: #4b4bff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.thinking-content {
  color: #888;
  font-size: 14px;
  line-height: 1.6;
}

.response-content {
  color: #fff;
  font-size: 14px;
  line-height: 1.6;
}

/* 添加渐变遮罩效果 */
.chat-input-container::before {
  content: '';
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #1e1e1e);
  pointer-events: none;
  z-index: -1;
}

/* 在已有样式中添加 */
.file-info-container {
  margin-top: 12px;
  padding: 12px;
  background: rgba(75, 75, 255, 0.05);
  border: 1px solid rgba(75, 75, 255, 0.1);
  border-radius: 8px;
}

.file-info-header {
  color: #4b4bff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.file-info-content {
  color: #fff;
  font-size: 14px;
  line-height: 1.6;
}

.file-info-content p {
  margin: 4px 0;
}

.search-loading-container.error {
  background: rgba(255, 75, 75, 0.1);
  border-color: rgba(255, 75, 75, 0.3);
}

.search-loading-container.error .search-loading-text {
  color: #ff4b4b;
}

/* 文件消息样式 */
:deep(.file-message) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(75, 75, 255, 0.05);
  border: 1px solid rgba(75, 75, 255, 0.1);
  border-radius: 8px;
  margin: 8px 0;
}

:deep(.file-message.error) {
  background: rgba(255, 75, 75, 0.05);
  border-color: rgba(255, 75, 75, 0.1);
}

:deep(.file-icon) {
  font-size: 24px;
}

:deep(.file-info) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.file-name) {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

:deep(.file-status) {
  color: #4b4bff;
  font-size: 12px;
}

:deep(.file-message.error .file-status) {
  color: #ff4b4b;
}

.upload-status-container {
  margin-bottom: 16px;
}

.upload-status {
  background: #2d2d2d;
  border-radius: 8px;
  overflow: hidden;
}

.upload-header {
  padding: 12px 16px;
  color: #fff;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.upload-content {
  padding: 12px 16px;
}

.upload-file {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 32px;
  height: 32px;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.file-status {
  color: #888;
  font-size: 12px;
}

/* 文件上传消息样式 */
:deep(.cefa5c26) {
  background: #2d2d2d;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  width: 220px;
  z-index: 11;
  position: relative;  /* 将相对定位移到父容器 */
}

:deep(.ca114c67) {
  display: none;
}

:deep(.cd190a50) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.d2d04dae) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
}

:deep(.aea7ca45) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.f3a54b52) {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;  /* 减小文件名显示宽度 */
}

:deep(.ee357eab) {
  color: #888;
  font-size: 11px;
}

:deep(.error-message) {
  color: #ff4b4b;
  padding: 12px;
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.3);
  border-radius: 8px;
  margin: 8px 0;
}

:deep(.header-content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.delete-btn) {
  background: none;
  border: none;
  color: #666;
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  position: absolute;  /* 保持绝对定位 */
  top: 4px;
  right: 4px;
  z-index: 12;  /* 确保按钮始终在最上层 */
}

:deep(.delete-btn:hover) {
  color: #ff4b4b;
  background: rgba(255, 75, 75, 0.1);
}

:deep(.ds-icon) {
  svg {
    &[data-type="pdf"] path {
      fill: #F8CA27;
    }
    &[data-type="doc"] path, &[data-type="docx"] path {
      fill: #4B8BF4;
    }
    &[data-type="xls"] path, &[data-type="xlsx"] path {
      fill: #34A853;
    }
    &[data-type="ppt"] path, &[data-type="pptx"] path {
      fill: #EA4335;
    }
    &[data-type="txt"] path {
      fill: #9AA0A6;
    }
    &[data-type="image"] path {
      fill: #4B8BF4;
    }
  }
}

:deep(.ds-icon.b3a5d6c1) {
  font-size: 24px;  /* 减小图标大小 */
  width: 24px;
  height: 24px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  color: #ff4b4b;
}
</style>