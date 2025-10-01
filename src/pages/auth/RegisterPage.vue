<template>
  <div class="register-page">
    <div class="back-to-home">
      <router-link to="/" class="back-link">
        <Icon icon="lucide:arrow-left" width="20" />
        <span>На главную</span>
      </router-link>
    </div>

    <AuthForm
      title="Регистрация"
      subtitle="Создайте новый аккаунт"
      submit-text="Зарегистрироваться"
      :show-password="true"
      :show-name="true"
      :show-email="true"
      :loading="loading"
      :error-message="errorMessage"
      @submit="handleRegister"
    >
      <template #actions>
        <div class="register-actions">
          <div class="terms-prompt">
            Регистрируясь, вы соглашаетесь с
            <a href="#" class="terms-link">условиями использования</a>
            и
            <a href="#" class="terms-link">политикой конфиденциальности</a>
          </div>
          <div class="login-prompt">
            Уже есть аккаунт?
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

// Methods
const handleRegister = async (formData: any) => {
  loading.value = true
  errorMessage.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock registration - in real app, call your API
    const success = await authStore.register({
      mobile: formData.mobile,
      password: formData.password,
      name: formData.name,
      email: formData.email || null
    })

    if (success) {
      // Redirect to home or verification page
      router.push('/')
    } else {
      errorMessage.value = 'Ошибка при регистрации. Попробуйте еще раз.'
    }
  } catch (error) {
    errorMessage.value = 'Произошла ошибка при регистрации. Попробуйте еще раз.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
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

.register-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.terms-prompt {
  color: #6b7280;
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.4;
  max-width: 300px;
}

.terms-link {
  color: #1a3a6b;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #2c5282;
  text-decoration: underline;
}

.login-prompt {
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
  
  .terms-prompt {
    font-size: 0.7rem;
  }
}
</style>

