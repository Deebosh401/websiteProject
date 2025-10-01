<template>
  <div class="forgot-password-page">
    <div class="back-to-home">
      <router-link to="/" class="back-link">
        <Icon icon="lucide:arrow-left" width="20" />
        <span>На главную</span>
      </router-link>
    </div>

    <AuthForm
      :title="currentStep === 'mobile' ? 'Восстановление пароля' : currentStep === 'verify' ? 'Подтверждение номера' : 'Новый пароль'"
      :subtitle="getSubtitle()"
      :submit-text="getSubmitText()"
      :show-password="currentStep === 'reset'"
      :show-verification-code="currentStep === 'verify'"
      :show-new-password="currentStep === 'reset'"
      :loading="loading"
      :error-message="errorMessage"
      @submit="handleSubmit"
      @resend-code="handleResendCode"
    >
      <template #actions>
        <div class="forgot-password-actions">
          <div class="back-to-login">
            Вспомнили пароль?
            <router-link to="/auth/login" class="login-link">
              Войти
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
const currentStep = ref<'mobile' | 'verify' | 'reset'>('mobile')
const mobileNumber = ref('')

// Methods
const getSubtitle = () => {
  switch (currentStep.value) {
    case 'mobile':
      return 'Введите номер телефона для восстановления пароля'
    case 'verify':
      return 'Введите код подтверждения, отправленный в SMS'
    case 'reset':
      return 'Введите новый пароль для вашего аккаунта'
    default:
      return ''
  }
}

const getSubmitText = () => {
  switch (currentStep.value) {
    case 'mobile':
      return 'Отправить код'
    case 'verify':
      return 'Подтвердить'
    case 'reset':
      return 'Сохранить пароль'
    default:
      return ''
  }
}

const handleSubmit = async (formData: any) => {
  loading.value = true
  errorMessage.value = ''

  try {
    switch (currentStep.value) {
      case 'mobile':
        await handleMobileStep(formData)
        break
      case 'verify':
        await handleVerifyStep(formData)
        break
      case 'reset':
        await handleResetStep(formData)
        break
    }
  } catch (error) {
    errorMessage.value = 'Произошла ошибка. Попробуйте еще раз.'
  } finally {
    loading.value = false
  }
}

const handleMobileStep = async (formData: any) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock sending verification code
  mobileNumber.value = formData.mobile
  currentStep.value = 'verify'
  
  // In real app, call your API to send SMS
  console.log('Sending SMS to:', formData.mobile)
}

const handleVerifyStep = async (formData: any) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock verification - in real app, verify the code with your API
  if (formData.verificationCode === '123456') {
    currentStep.value = 'reset'
  } else {
    errorMessage.value = 'Неверный код подтверждения'
  }
}

const handleResetStep = async (formData: any) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock password reset - in real app, call your API
  const success = await authStore.resetPassword({
    mobile: mobileNumber.value,
    verificationCode: '123456', // In real app, this would be validated
    newPassword: formData.newPassword
  })

  if (success) {
    // Redirect to login page
    router.push('/auth/login')
  } else {
    errorMessage.value = 'Ошибка при смене пароля. Попробуйте еще раз.'
  }
}

const handleResendCode = async () => {
  if (currentStep.value === 'verify') {
    loading.value = true
    try {
      // Simulate resending code
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Resending SMS to:', mobileNumber.value)
    } catch (error) {
      errorMessage.value = 'Ошибка при отправке кода. Попробуйте еще раз.'
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.forgot-password-page {
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

.forgot-password-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.back-to-login {
  color: #666;
  font-size: 0.875rem;
}

.login-link {
  color: #1a3a6b;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.login-link:hover {
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

