import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'admin' | 'user' | 'guide' | 'business_owner'

export interface User {
  id: string
  mobile: string
  name: string
  email?: string
  role: UserRole
  createdAt: string
  isVerified?: boolean
  profileImage?: string
  // Additional fields for different user types
  businessInfo?: {
    businessName: string
    businessType: string
    description: string
    location: string
    website?: string
    socialMedia?: {
      instagram?: string
      facebook?: string
      telegram?: string
    }
  }
  guideInfo?: {
    specialties: string[]
    languages: string[]
    experience: string
    certifications?: string[]
    hourlyRate?: number
    availability: {
      days: string[]
      hours: { start: string; end: string }
    }
  }
}

interface LoginCredentials {
  mobile: string
  password: string
}

interface LoginWithVerification {
  mobile: string
  password: string
  verificationCode: string
}

interface RegisterData {
  mobile: string
  password: string
  name: string
  email?: string | null
  role?: UserRole
  businessInfo?: User['businessInfo']
  guideInfo?: User['guideInfo']
}

interface ResetPasswordData {
  mobile: string
  verificationCode: string
  newPassword: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userDisplayName = computed(() => user.value?.name || 'Пользователь')
  const userRole = computed(() => user.value?.role || 'user')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isGuide = computed(() => user.value?.role === 'guide')
  const isBusinessOwner = computed(() => user.value?.role === 'business_owner')
  const isRegularUser = computed(() => user.value?.role === 'user')

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // This method is now deprecated in favor of loginWithVerification
    // Keep for backward compatibility
    return loginWithVerification({
      ...credentials,
      verificationCode: '123456' // Default code for backward compatibility
    })
  }

  const loginWithVerification = async (data: LoginWithVerification): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock authentication with verification - in real app, replace with actual API call
      if (data.mobile === '9991234567' && data.password === 'password123' && data.verificationCode === '123456') {
        const mockUser: User = {
          id: '1',
          mobile: data.mobile,
          name: 'Администратор',
          email: 'admin@example.com',
          role: 'admin',
          isVerified: true,
          createdAt: new Date().toISOString()
        }
        
        const mockToken = 'mock-jwt-token-' + Date.now()
        
        user.value = mockUser
        token.value = mockToken
        
        // Store in localStorage for persistence
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('auth_user', JSON.stringify(mockUser))
        
        return true
      } else {
        error.value = 'Неверные данные или код подтверждения'
        return false
      }
    } catch (err) {
      error.value = 'Ошибка при входе в систему'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock registration - in real app, replace with actual API call
      const mockUser: User = {
        id: Date.now().toString(),
        mobile: data.mobile,
        name: data.name,
        email: data.email || undefined,
        role: data.role || 'user',
        isVerified: false,
        createdAt: new Date().toISOString(),
        businessInfo: data.businessInfo,
        guideInfo: data.guideInfo
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      user.value = mockUser
      token.value = mockToken
      
      // Store in localStorage for persistence
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      
      return true
    } catch (err) {
      error.value = 'Ошибка при регистрации'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (data: ResetPasswordData): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock password reset - in real app, replace with actual API call
      console.log('Resetting password for:', data.mobile)
      console.log('Verification code:', data.verificationCode)
      console.log('New password:', data.newPassword)
      
      return true
    } catch (err) {
      error.value = 'Ошибка при смене пароля'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear state
      user.value = null
      token.value = null
      error.value = null
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // In real app, you might want to call a logout API endpoint
    } catch (err) {
      error.value = 'Ошибка при выходе из системы'
    } finally {
      isLoading.value = false
    }
  }

  const initializeAuth = (): void => {
    // Check if user is already logged in (from localStorage)
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } catch (err) {
        // Clear invalid stored data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }

  const sendVerificationCode = async (mobile: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock sending verification code
      console.log('Sending verification code to:', mobile)
      
      return true
    } catch (err) {
      error.value = 'Ошибка при отправке кода подтверждения'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const verifyCode = async (_mobile: string, code: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock verification - in real app, verify with your API
      return code === '123456'
    } catch (err) {
      error.value = 'Ошибка при проверке кода'
      return false
    } finally {
      isLoading.value = false
    }
  }

    return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userRole,
    isAdmin,
    isGuide,
    isBusinessOwner,
    isRegularUser,
    
    // Actions
    login,
    loginWithVerification,
    register,
    resetPassword,
    logout,
    initializeAuth,
    sendVerificationCode,
    verifyCode
  }
})
