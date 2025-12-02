<template>
  <Transition name="fade">
    <div v-if="visible" class="message-box-overlay">
      <div class="message-box" :class="type">
        <div class="message-box-icon">
          <svg v-if="type === 'success'" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
        </div>
        <div class="message-box-content">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
        </div>
        <button class="message-box-button" @click="handleConfirm">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  message: string
  type?: 'success' | 'error'
  buttonText?: string
  onConfirm?: () => void
}>()

const visible = ref(true)

const handleConfirm = () => {
  visible.value = false
  props.onConfirm?.()
}
</script>

<style scoped>
.message-box-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.message-box {
  background: #2d2d2d;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.message-box-icon {
  margin-bottom: 16px;
  color: #4b4bff;
}

.success .message-box-icon {
  color: #34A853;
}

.error .message-box-icon {
  color: #EA4335;
}

.message-box-content h3 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 8px;
}

.message-box-content p {
  color: #888;
  font-size: 14px;
  margin-bottom: 24px;
}

.message-box-button {
  background: #4b4bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.message-box-button:hover {
  background: #3a3aff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 