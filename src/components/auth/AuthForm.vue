<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">{{ title }}</h1>
        <p class="auth-subtitle">{{ subtitle }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="mobile" class="form-label">Номер телефона</label>
          <div class="mobile-input-wrapper">
            <span class="country-code">+7</span>
            <input
              id="mobile"
              v-model="formData.mobile"
              type="tel"
              class="form-input mobile-input"
              placeholder="(999) 123-45-67"
              maxlength="10"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div v-if="showPassword" class="form-group">
          <label for="password" class="form-label">Пароль</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPasswordField ? 'text' : 'password'"
              class="form-input password-input"
              placeholder="Введите пароль"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPasswordField = !showPasswordField"
              :disabled="loading"
            >
              <Icon :icon="showPasswordField ? 'mdi:eye-off' : 'mdi:eye'" />
            </button>
          </div>
        </div>

        <div v-if="showName" class="form-group">
          <label for="name" class="form-label">Имя</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="Введите ваше имя"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="showEmail" class="form-group">
          <label for="email" class="form-label">Email (необязательно)</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            placeholder="example@email.com"
            :disabled="loading"
          />
        </div>

        <div v-if="showVerificationCode" class="form-group">
          <label for="verificationCode" class="form-label">Код подтверждения</label>
          <input
            id="verificationCode"
            v-model="formData.verificationCode"
            type="text"
            class="form-input"
            placeholder="Введите код из SMS"
            maxlength="6"
            required
            :disabled="loading"
          />
          <p class="verification-hint">
            Код отправлен на номер +7{{ formattedMobile }}
          </p>
          <div class="resend-code-wrapper">
            <button
              type="button"
              class="resend-btn"
              @click="resendCode"
              :disabled="loading || resendCooldown > 0"
            >
              {{ resendCooldown > 0 ? `Повторить через ${resendCooldown}с` : 'Отправить повторно' }}
            </button>
          </div>
        </div>

        <div v-if="showNewPassword" class="form-group">
          <label for="newPassword" class="form-label">Новый пароль</label>
          <div class="password-input-wrapper">
            <input
              id="newPassword"
              v-model="formData.newPassword"
              :type="showNewPasswordField ? 'text' : 'password'"
              class="form-input password-input"
              placeholder="Введите новый пароль"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showNewPasswordField = !showNewPasswordField"
              :disabled="loading"
            >
              <Icon :icon="showNewPasswordField ? 'mdi:eye-off' : 'mdi:eye'" />
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="loading || !isFormValid"
        >
          <Icon v-if="loading" icon="mdi:loading" class="loading-icon" />
          {{ loading ? 'Загрузка...' : submitText }}
        </button>

        <div class="auth-actions">
          <slot name="actions"></slot>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

interface AuthFormData {
  mobile: string
  password?: string
  name?: string
  email?: string
  verificationCode?: string
  newPassword?: string
}

interface Props {
  title: string
  subtitle: string
  submitText: string
  showPassword?: boolean
  showName?: boolean
  showEmail?: boolean
  showVerificationCode?: boolean
  showNewPassword?: boolean
  loading?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  showPassword: false,
  showName: false,
  showEmail: false,
  showVerificationCode: false,
  showNewPassword: false,
  loading: false,
  errorMessage: ''
})

const emit = defineEmits<{
  submit: [data: AuthFormData]
  resendCode: []
}>()

// Form data
const formData = ref<AuthFormData>({
  mobile: '',
  password: '',
  name: '',
  email: '',
  verificationCode: '',
  newPassword: ''
})

// Password visibility
const showPasswordField = ref(false)
const showNewPasswordField = ref(false)

// Resend cooldown
const resendCooldown = ref(0)
let resendTimer: number | null = null

// Computed properties
const formattedMobile = computed(() => {
  const mobile = formData.value.mobile.replace(/\D/g, '')
  if (mobile.length >= 10) {
    return `(${mobile.slice(0, 3)}) ${mobile.slice(3, 6)}-${mobile.slice(6, 8)}-${mobile.slice(8, 10)}`
  }
  return mobile
})

const isFormValid = computed(() => {
  if (!formData.value.mobile || formData.value.mobile.length !== 10) {
    return false
  }
  
  if (props.showPassword && !formData.value.password) {
    return false
  }
  
  if (props.showName && !formData.value.name) {
    return false
  }
  
  if (props.showVerificationCode && !formData.value.verificationCode) {
    return false
  }
  
  if (props.showNewPassword && !formData.value.newPassword) {
    return false
  }
  
  return true
})

// Methods
const handleSubmit = () => {
  if (isFormValid.value && !props.loading) {
    emit('submit', { ...formData.value })
  }
}

const resendCode = () => {
  if (resendCooldown.value === 0) {
    emit('resendCode')
    startResendCooldown()
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer!)
      resendTimer = null
    }
  }, 1000)
}

// Format mobile input
const formatMobileInput = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 10) {
    formData.value.mobile = digits
  }
}

// Watch mobile input
const handleMobileInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  formatMobileInput(target.value)
}

onMounted(() => {
  // Add input event listener for mobile formatting
  const mobileInput = document.getElementById('mobile') as HTMLInputElement
  if (mobileInput) {
    mobileInput.addEventListener('input', handleMobileInput)
  }
})

onUnmounted(() => {
  if (resendTimer) {
    clearInterval(resendTimer)
  }
  
  const mobileInput = document.getElementById('mobile') as HTMLInputElement
  if (mobileInput) {
    mobileInput.removeEventListener('input', handleMobileInput)
  }
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f5f2 0%, #e8e5e2 50%, #f0ede8 100%);
  padding: 1rem;
}

.auth-card {
  background: #f8f5f2;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.form-input:focus {
  outline: none;
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.form-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.mobile-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.mobile-input-wrapper:focus-within {
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.country-code {
  padding: 0.875rem 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  color: #666;
  font-weight: 500;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.mobile-input {
  border: none;
  flex: 1;
  padding: 0.875rem 1rem;
}

.mobile-input:focus {
  box-shadow: none;
}

.password-input-wrapper {
  position: relative;
}

.password-input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #333;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.verification-hint {
  font-size: 0.75rem;
  color: #666;
  margin: 0.5rem 0 0.75rem 0;
  text-align: center;
}

.resend-code-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.resend-btn {
  background: none;
  border: none;
  color: #1a3a6b;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.resend-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
  text-decoration: none;
}

.error-message {
  background: rgba(254, 226, 226, 0.8);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
  backdrop-filter: blur(8px);
}

.submit-btn {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 10px rgba(26, 58, 107, 0.2);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.3);
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-actions {
  text-align: center;
  margin-top: 1rem;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .auth-container {
    padding: 0.5rem;
  }
  
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
}
</style>
