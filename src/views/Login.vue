<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="../assets/deepseek.svg" alt="AssistGen" />
      </div>
      
      <h2 class="login-title">{{ activeTab === 'login' ? 'Sign in to your account' : 'Create an account' }}</h2>

      <div class="form-container">
        <div v-if="errors.general" class="general-error">
          {{ errors.general }}
        </div>
        
        <div class="input-group" v-if="activeTab === 'register'">
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="Please enter a username"
            :class="{ 'error': errors.username }"
          />
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>

        <div class="input-group">
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="Please enter your email"
            :class="{ 'error': errors.email }"
          />
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>
        
        <div class="input-group">
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="Please enter your password"
            :class="{ 'error': errors.password }"
          />
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <div class="input-group" v-if="activeTab === 'register'">
          <input 
            type="password" 
            v-model="form.confirmPassword" 
            placeholder="Please confirm your password"
          />
        </div>

        <div class="agreement">
          <input type="checkbox" v-model="form.agreement" id="agreement" />
          <label for="agreement">
            I agree to the <a href="#" @click.prevent="showTerms">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
          </label>
        </div>

        <button class="submit-btn" @click="handleSubmit" :disabled="!isFormValid">
          {{ activeTab === 'login' ? 'Sign In' : 'Sign Up' }}
        </button>

        <div class="register-link">
          {{ activeTab === 'login' ? "Don't have an account yet?" : 'Already have an account?' }}
          <a href="#" @click.prevent="handleTabChange">
            {{ activeTab === 'login' ? 'Sign up now' : 'Back to sign in' }}
          </a>
        </div>

        <div class="other-login" v-if="activeTab === 'login'">
          <div class="divider">
            <span>Other sign-in methods</span>
          </div>
          <button class="wechat-btn" @click="handleWechatLogin">
            <img src="../assets/wechat.svg" alt="WeChat" />
            Sign in automatically with WeChat
          </button>
        </div>
      </div>
    </div>
    <MessageBox
      v-if="showSuccessMessage"
      title="Sign up successful"
      message="Please sign in with your new account"
      type="success"
      buttonText="Go to sign in"
      @confirm="handleSuccessConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '../services/api'
import MessageBox from '../components/MessageBox.vue'

const router = useRouter()
const activeTab = ref('login')

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const errors = ref({
  username: '',
  email: '',
  password: '',
  general: ''
})

const showSuccessMessage = ref(false)

const validateRules = {
  username: {
    pattern: /^[a-zA-Z0-9_]{4,16}$/,
    message: 'Username must be 4-16 characters and contain only letters, numbers, or underscores'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    message: 'Password must be at least 8 characters and include uppercase, lowercase letters, and numbers'
  }
}

const validate = (field: 'username' | 'email' | 'password', value: string) => {
  if (!value) {
    errors.value[field] = `Please enter ${field === 'username' ? 'a username' : field === 'email' ? 'an email address' : 'a password'}`
    return false
  }
  if (!validateRules[field].pattern.test(value)) {
    errors.value[field] = validateRules[field].message
    return false
  }
  errors.value[field] = ''
  return true
}

const isFormValid = computed(() => {
  if (activeTab.value === 'login') {
    return form.value.email && 
           form.value.password &&
           validate('email', form.value.email) &&
           validate('password', form.value.password)
  } else {
    return form.value.username && 
           form.value.email &&
           form.value.password && 
           form.value.confirmPassword && 
           form.value.password === form.value.confirmPassword &&
           form.value.agreement &&
           validate('username', form.value.username) &&
           validate('email', form.value.email) &&
           validate('password', form.value.password)
  }
})

const clearErrors = () => {
  errors.value = {
    username: '',
    email: '',
    password: '',
    general: ''
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  clearErrors()
  
  try {
    if (activeTab.value === 'register') {
      await AuthService.register({
        username: form.value.username,
        email: form.value.email,
        password: form.value.password
      })
      showSuccessMessage.value = true
      router.replace('/login')
      activeTab.value = 'login'
    } else {
      const response = await AuthService.login({
        email: form.value.email,
        password: form.value.password
      })
      localStorage.setItem('token', response.access_token)
      router.push('/')
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      errors.value.general = 'Incorrect email or password'
    } else if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      if (typeof detail === 'string') {
        errors.value.general = detail
      } else if (Array.isArray(detail)) {
        detail.forEach(err => {
          const field = err.loc[1]
          errors.value[field as keyof typeof errors.value] = err.msg
        })
      }
    } else {
      errors.value.general = 'An error occurred, please try again later'
    }
  }
}

const handleSuccessConfirm = () => {
  showSuccessMessage.value = false
  activeTab.value = 'login'
  form.value = {
    username: form.value.username,
    email: form.value.email,
    password: '',
    confirmPassword: '',
    agreement: false
  }
}

const handleWechatLogin = () => {
  // TODO: Implement WeChat sign-in logic
}

const showTerms = () => {
  // TODO: Show Terms of Service
}

const showPrivacy = () => {
  // TODO: Show Privacy Policy
}

const handleTabChange = () => {
  const newTab = activeTab.value === 'login' ? 'register' : 'login'
  activeTab.value = newTab
  // Update the URL without triggering a new navigation
  router.replace(`/${newTab}`)
}

onMounted(() => {
  // Set the correct tab based on the current route
  activeTab.value = router.currentRoute.value.path === '/register' ? 'register' : 'login'
})

watch(() => form.value.username, (val) => {
  if (activeTab.value === 'register' && val) {
    validate('username', val)
  }
})

watch(() => form.value.email, (val) => {
  if (val) validate('email', val)
})

watch(() => form.value.password, (val) => {
  if (val) validate('password', val)
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #1e1e1e;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #2d2d2d;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo img {
  height: 40px;
}

.login-title {
  color: #fff;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 32px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  color: #888;
  font-size: 14px;
}

.register-link a {
  color: #4b4bff;
  text-decoration: none;
  margin-left: 8px;
}

.register-link a:hover {
  text-decoration: underline;
}

.input-group {
  margin-bottom: 16px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s;
}

.input-group input:focus {
  border-color: #4b4bff;
  outline: none;
}

.agreement {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  color: #888;
  font-size: 14px;
}

.agreement a {
  color: #4b4bff;
  text-decoration: none;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #4b4bff;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #5c5cff;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.other-login {
  margin-top: 32px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #333;
  margin: 0 16px;
}

.wechat-btn {
  width: 100%;
  padding: 12px;
  background: #1AAD19;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.wechat-btn:hover {
  background: #2abd29;
}

.wechat-btn img {
  width: 24px;
  height: 24px;
}

.error {
  border-color: #ff4b4b !important;
}

.error-message {
  color: #ff4b4b;
  font-size: 12px;
  margin-top: 4px;
}

.general-error {
  color: #ff4b4b;
  text-align: center;
  margin-bottom: 16px;
}
</style> 