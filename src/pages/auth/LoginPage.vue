<template>
  <div class="login-page">
    <div class="back-to-home">
      <router-link to="/" class="back-link">
        <Icon icon="lucide:arrow-left" width="20" />
        <span>На главную</span>
      </router-link>
    </div>

    <AuthForm
      :title="currentStep === 'credentials' ? 'Вход в аккаунт' : 'Подтверждение входа'"
      :subtitle="getSubtitle()"
      :submit-text="getSubmitText()"
      :show-password="currentStep === 'credentials'"
      :show-verification-code="currentStep === 'verification'"
      :loading="loading"
      :error-message="errorMessage"
      @submit="handleSubmit"
      @resend-code="handleResendCode"
    >
      <template #actions>
        <div class="login-actions">
          <router-link to="/auth/forgot-password" class="forgot-password-link">
            Забыли пароль?
          </router-link>
          <div class="signup-prompt">
            Нет аккаунта?
            <router-link to="/auth/register" class="signup-link">
              Зарегистрироваться
            </router-link>
          </div>
        </div>
      </template>
    </AuthForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AuthForm from '../../components/auth/AuthForm.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const errorMessage = ref('')
const currentStep = ref<'credentials' | 'verification'>('credentials')
const userCredentials = ref<{ mobile: string; password: string } | null>(null)

// Methods
const getSubtitle = () => {
  switch (currentStep.value) {
    case 'credentials':
      return 'Введите номер телефона и пароль для входа'
    case 'verification':
      return 'Введите код подтверждения, отправленный в SMS'
    default:
      return ''
  }
}

const getSubmitText = () => {
  switch (currentStep.value) {
    case 'credentials':
      return 'Отправить код'
    case 'verification':
      return 'Подтвердить вход'
    default:
      return ''
  }
}

const handleSubmit = async (formData: any) => {
  loading.value = true
  errorMessage.value = ''

  try {
    if (currentStep.value === 'credentials') {
      await handleCredentialsStep(formData)
    } else if (currentStep.value === 'verification') {
      await handleVerificationStep(formData)
    }
  } catch (error) {
    errorMessage.value = 'Произошла ошибка. Попробуйте еще раз.'
  } finally {
    loading.value = false
  }
}

const handleCredentialsStep = async (formData: any) => {
  // Simulate API call to verify credentials
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock credential verification - in real app, call your API
  if (formData.mobile === '9991234567' && formData.password === 'password123') {
    // Store credentials for verification step
    userCredentials.value = {
      mobile: formData.mobile,
      password: formData.password
    }
    
    // Send verification code
    const codeSent = await authStore.sendVerificationCode(formData.mobile)
    
    if (codeSent) {
      // Move to verification step
      currentStep.value = 'verification'
    } else {
      errorMessage.value = 'Ошибка при отправке кода подтверждения'
    }
  } else {
    errorMessage.value = 'Неверный номер телефона или пароль'
  }
}

const handleVerificationStep = async (formData: any) => {
  if (!userCredentials.value) {
    errorMessage.value = 'Ошибка сессии. Попробуйте войти заново.'
    return
  }

  // Simulate API call to verify code
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock code verification - in real app, verify with your API
  if (formData.verificationCode === '123456') {
    // Complete login with stored credentials
    const success = await authStore.loginWithVerification({
      mobile: userCredentials.value.mobile,
      password: userCredentials.value.password,
      verificationCode: formData.verificationCode
    })

    if (success) {
      // Redirect to home or intended page
      router.push('/')
    } else {
      errorMessage.value = 'Ошибка при завершении входа'
    }
  } else {
    errorMessage.value = 'Неверный код подтверждения'
  }
}

const handleResendCode = async () => {
  if (currentStep.value === 'verification' && userCredentials.value) {
    loading.value = true
    try {
      // Simulate resending code
      await new Promise(resolve => setTimeout(resolve, 1000))
      const codeSent = await authStore.sendVerificationCode(userCredentials.value.mobile)
      
      if (!codeSent) {
        errorMessage.value = 'Ошибка при отправке кода. Попробуйте еще раз.'
      }
    } catch (error) {
      errorMessage.value = 'Ошибка при отправке кода. Попробуйте еще раз.'
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
}

.back-to-home {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.back-link:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.forgot-password-link {
  color: #1a3a6b;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password-link:hover {
  color: #2c5282;
  text-decoration: underline;
}

.signup-prompt {
  color: #666;
  font-size: 0.875rem;
}

.signup-link {
  color: #1a3a6b;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.signup-link:hover {
  color: #2c5282;
  text-decoration: underline;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .back-to-home {
    top: 0.5rem;
    left: 0.5rem;
  }
  
  .back-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
