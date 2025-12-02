import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const username = ref('')
  const email = ref('')
  const theme = ref<'dark' | 'light'>('dark')

  const setUserInfo = (info: { username: string; email: string }) => {
    username.value = info.username
    email.value = info.email
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return {
    username,
    email,
    theme,
    setUserInfo,
    toggleTheme
  }
}) 