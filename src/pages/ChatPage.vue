<template>
  <div class="chat-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="chat-title">Сообщения</h1>
        <p class="chat-subtitle">Общайтесь с пользователями, гидами и бизнесами</p>
      </div>
    </div>

    <div class="chat-interface">
      <div class="chat-sidebar" :class="{ collapsed: chatSidebarCollapsed }">
        <div class="sidebar-header">
          <div class="sidebar-title">
            <Icon icon="mdi:inbox" />
            <span v-if="!chatSidebarCollapsed">Входящие</span>
          </div>
          <button @click="chatSidebarCollapsed = !chatSidebarCollapsed" class="collapse-btn">
            <Icon :icon="chatSidebarCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" />
          </button>
        </div>

        <div v-if="!chatSidebarCollapsed" class="sidebar-content">
          <div class="inbox-nav">
            <button 
              :class="['inbox-nav-btn', { active: inboxTab === 'all' }]"
              @click="inboxTab = 'all'"
            >
              <Icon icon="mdi:inbox" />
              <span>Все сообщения</span>
              <span v-if="totalUnreadCount > 0" class="nav-badge">{{ totalUnreadCount }}</span>
            </button>
            <button 
              :class="['inbox-nav-btn', { active: inboxTab === 'businesses' }]"
              @click="inboxTab = 'businesses'"
            >
              <Icon icon="mdi:store" />
              <span>Бизнесы</span>
            </button>
            <button 
              :class="['inbox-nav-btn', { active: inboxTab === 'guides' }]"
              @click="inboxTab = 'guides'"
            >
              <Icon icon="mdi:account-tie" />
              <span>Гиды</span>
            </button>
            <button 
              :class="['inbox-nav-btn', { active: inboxTab === 'users' }]"
              @click="inboxTab = 'users'"
            >
              <Icon icon="mdi:users" />
              <span>Пользователи</span>
            </button>
          </div>

          <div class="chat-search">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск сообщений..." 
              class="search-input"
            />
            <Icon icon="mdi:magnify" class="search-icon" />
          </div>


          <div class="message-list">
            <div v-if="filteredMessages.length === 0" class="empty-messages">
              <Icon icon="mdi:message-outline" class="empty-icon" />
              <p v-if="inboxTab === 'all'">Нет сообщений</p>
              <p v-else>Нет сообщений в этой категории</p>
            </div>
            
            <div v-else>
              <div 
                v-for="message in filteredMessages" 
                :key="message.id" 
                :class="['message-item', { active: selectedChat?.id === message.id, unread: message.unreadCount > 0 }]"
                @click="selectMessage(message)"
              >
                <div class="message-avatar">
                  <img 
                    :src="getMessageAvatar(message)" 
                    :alt="getMessageSender(message)" 
                    class="avatar-image"
                  />
                  <div v-if="message.unreadCount > 0" class="unread-badge">
                    {{ message.unreadCount > 99 ? '99+' : message.unreadCount }}
                  </div>
                  <div class="sender-role-badge" :class="getSenderRole(message)">
                    <Icon :icon="getRoleIcon(getSenderRole(message))" />
                  </div>
                </div>
                
                <div class="message-info">
                  <div class="message-header">
                    <div class="sender-name">{{ getMessageSender(message) }}</div>
                    <div class="message-time">{{ formatTime(typeof message.lastMessage?.timestamp === 'number' ? message.lastMessage.timestamp : Date.now()) }}</div>
                  </div>
                  <div class="message-preview">
                    <span v-if="message.lastMessage" class="last-message">
                      {{ message.lastMessage.content }}
                    </span>
                    <span v-else class="no-messages">Нет сообщений</span>
                  </div>
                  <div class="message-meta">
                    <span class="sender-role">{{ getUserRoleLabel(getSenderRole(message)) }}</span>
                    <span v-if="message.lastMessage?.isRead && message.lastMessage?.senderId !== currentUserId" class="read-status">
                      <Icon icon="mdi:check-all" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-area">
        <div v-if="!selectedChat" class="no-chat-selected">
          <Icon icon="mdi:message-outline" class="empty-icon" />
          <h3>Выберите чат</h3>
          <p>Выберите чат из списка, чтобы начать общение</p>
        </div>

        <div v-else class="chat-container">
          <div class="chat-header">
            <div class="chat-user-info">
              <img 
                :src="getChatAvatar(selectedChat)" 
                :alt="getChatName(selectedChat)" 
                class="chat-avatar"
              />
              <div class="chat-user-details">
                <h3 class="chat-user-name">{{ getChatName(selectedChat) }}</h3>
                <p class="chat-user-status">{{ getUserRoleLabel(getChatUserRole(selectedChat)) }}</p>
              </div>
            </div>
            <div class="chat-actions">
              <button @click="showChatInfo = true" class="action-btn">
                <Icon icon="mdi:information" />
              </button>
            </div>
          </div>

          <div class="messages-area" ref="messagesArea">
            <div v-for="message in chatMessages" :key="message.id" class="message" :class="{ 'own-message': message.senderId === currentUserId }">
              <div class="message-content">
                <div v-if="message.replyTo" class="reply-preview">
                  <div class="reply-line"></div>
                  <div class="reply-content">
                    <span class="reply-sender">{{ getReplySender(message.replyTo) }}</span>
                    <span class="reply-text">{{ getReplyContent(message.replyTo) }}</span>
                  </div>
                </div>
                
                <div class="message-text">{{ message.content }}</div>
                
                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                  <div v-for="(attachment, index) in message.attachments" :key="index" class="attachment">
                    <img 
                      v-if="attachment.type === 'image'" 
                      :src="attachment.url" 
                      :alt="attachment.name"
                      @click="openImageModal(attachment.url)"
                      class="attachment-image"
                    />
                    <div v-else class="attachment-file">
                      <Icon icon="mdi:file" />
                      <span>{{ attachment.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="message-meta">
                <span class="message-time">{{ formatTime(typeof message.timestamp === 'number' ? message.timestamp : Date.now()) }}</span>
                <div v-if="message.senderId === currentUserId" class="message-status">
                  <Icon v-if="message.isRead" icon="mdi:check-all" class="read-icon" />
                  <Icon v-else icon="mdi:check" class="sent-icon" />
                </div>
              </div>
            </div>
          </div>

          <div class="message-input-area">
            <div class="input-actions">
              <button @click="attachFile" class="attach-btn">
                <Icon icon="mdi:paperclip" />
              </button>
            </div>
            
            <div class="message-input-wrapper">
              <textarea 
                v-model="newMessage" 
                @keydown.enter.prevent="sendMessage"
                placeholder="Введите сообщение..."
                class="message-input"
                rows="1"
                ref="messageInput"
              ></textarea>
            </div>
            
            <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-btn">
              <Icon icon="mdi:send" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="floating-actions">
      <button @click="showNewMessageModal = true" class="fab new-message-fab" title="Новое сообщение">
        <Icon icon="mdi:plus" />
      </button>
      
      <button @click="$router.back()" class="fab go-back-fab" title="Назад">
        <Icon icon="mdi:arrow-left" />
      </button>
    </div>

    <div v-if="showNewMessageModal" class="modal-overlay" @click="showNewMessageModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Новое сообщение</h3>
          <button @click="showNewMessageModal = false" class="close-btn">
            <Icon icon="mdi:close" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="user-search">
            <input 
              v-model="userSearchQuery" 
              type="text" 
              placeholder="Поиск пользователей, гидов, бизнесов..." 
              class="search-input"
            />
          </div>
          
          <div class="user-categories">
            <div class="category-section">
              <h4>Бизнесы</h4>
              <div class="user-list">
                <div 
                  v-for="user in filteredUsers.filter(u => u.role === 'business_owner')" 
                  :key="user.id"
                  class="user-item"
                  @click="startChatWithUser(user)"
                >
                  <img :src="user.avatar || '/default-avatar.png'" :alt="user.name" class="user-avatar" />
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-role">{{ getUserRoleLabel(user.role) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="category-section">
              <h4>Гиды</h4>
              <div class="user-list">
                <div 
                  v-for="user in filteredUsers.filter(u => u.role === 'guide')" 
                  :key="user.id"
                  class="user-item"
                  @click="startChatWithUser(user)"
                >
                  <img :src="user.avatar || '/default-avatar.png'" :alt="user.name" class="user-avatar" />
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-role">{{ getUserRoleLabel(user.role) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="category-section">
              <h4>Пользователи</h4>
              <div class="user-list">
                <div 
                  v-for="user in filteredUsers.filter(u => u.role === 'user')" 
                  :key="user.id"
                  class="user-item"
                  @click="startChatWithUser(user)"
                >
                  <img :src="user.avatar || '/default-avatar.png'" :alt="user.name" class="user-avatar" />
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-role">{{ getUserRoleLabel(user.role) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showImageModal" class="modal-overlay" @click="showImageModal = false">
      <div class="image-modal" @click.stop>
        <button @click="showImageModal = false" class="close-btn">
          <Icon icon="mdi:close" />
        </button>
        <img :src="selectedImage" :alt="selectedImage" class="modal-image" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  getChatsByUser, 
  getMessagesByChat, 
  sendMessage as sendChatMessage, 
  markMessagesAsRead, 
  getOrCreateDirectChat,
  type Chat,
  type ChatMessage,
  type UserRole
} from '../Data'
import { Icon } from '@iconify/vue'

const authStore = useAuthStore()

// State
const selectedChat = ref<Chat | null>(null)
const chatMessages = ref<ChatMessage[]>([])
const newMessage = ref('')
const searchQuery = ref('')
const chatSidebarCollapsed = ref(false)
const showNewMessageModal = ref(false)
const showChatInfo = ref(false)
const showImageModal = ref(false)
const selectedImage = ref('')
const userSearchQuery = ref('')
const inboxTab = ref('all')

// Mock users for new chat
const mockUsers = ref([
  { id: '2', name: 'Иван Петров', role: 'user' as UserRole, avatar: '/default-avatar.png' },
  { id: '3', name: 'Мария Сидорова', role: 'guide' as UserRole, avatar: '/default-avatar.png' },
  { id: '4', name: 'Алексей Козлов', role: 'business_owner' as UserRole, avatar: '/default-avatar.png' },
  { id: '5', name: 'Елена Волкова', role: 'user' as UserRole, avatar: '/default-avatar.png' },
  { id: '6', name: 'Дмитрий Соколов', role: 'guide' as UserRole, avatar: '/default-avatar.png' }
])

// Computed
const currentUserId = computed(() => authStore.user?.id || '1')

const userChats = computed(() => {
  return getChatsByUser(currentUserId.value)
})

const totalUnreadCount = computed(() => {
  return userChats.value.reduce((total, chat) => total + chat.unreadCount, 0)
})

const filteredMessages = computed(() => {
  let messages = userChats.value
  
  // Filter by inbox tab
  if (inboxTab.value !== 'all') {
    messages = messages.filter(chat => {
      const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
      return otherParticipant?.role === inboxTab.value
    })
  }
  
  // Filter by search query
  if (searchQuery.value) {
    messages = messages.filter(chat => {
      const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
      return otherParticipant?.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             (chat.lastMessage?.content.toLowerCase().includes(searchQuery.value.toLowerCase()))
    })
  }
  
  return messages
})

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return mockUsers.value
  
  return mockUsers.value.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.value.toLowerCase())
  )
})

// Methods
const getChatName = (chat: Chat) => {
  if (chat.type === 'group') {
    return chat.name
  }
  
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
  return otherParticipant?.name || 'Неизвестный пользователь'
}

const getChatAvatar = (chat: Chat) => {
  if (chat.type === 'group') {
    return '/group-avatar.png'
  }
  
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
  return otherParticipant?.avatar || '/default-avatar.png'
}

const getChatUserRole = (chat: Chat) => {
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
  return otherParticipant?.role || 'user'
}

const getUserRoleLabel = (role: UserRole) => {
  const labels: Record<UserRole, string> = {
    admin: 'Администратор',
    user: 'Пользователь',
    guide: 'Гид',
    business_owner: 'Владелец бизнеса'
  }
  return labels[role] || 'Пользователь'
}

const getReplyContent = (messageId: string) => {
  const message = chatMessages.value.find(m => m.id === messageId)
  return message?.content || 'Сообщение удалено'
}

const getMessageSender = (chat: Chat) => {
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
  return otherParticipant?.name || 'Неизвестный пользователь'
}

const getMessageAvatar = (chat: Chat) => {
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
  return otherParticipant?.avatar || '/default-avatar.png'
}

const getSenderRole = (chat: Chat) => {
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId.value)
  return otherParticipant?.role || 'user'
}

const getRoleIcon = (role: UserRole) => {
  const icons: Record<UserRole, string> = {
    admin: 'mdi:shield-crown',
    user: 'mdi:account',
    guide: 'mdi:account-tie',
    business_owner: 'mdi:store'
  }
  return icons[role] || 'mdi:account'
}

const selectChat = (chat: Chat) => {
  selectedChat.value = chat
  chatMessages.value = getMessagesByChat(chat.id)
  markMessagesAsRead(chat.id, currentUserId.value)
  
  nextTick(() => {
    scrollToBottom()
  })
}

const selectMessage = (chat: Chat) => {
  selectChat(chat)
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedChat.value) return
  
  sendChatMessage(
    selectedChat.value.id,
    currentUserId.value,
    authStore.userDisplayName || 'Пользователь',
    authStore.userRole || 'user',
    newMessage.value.trim()
  )
  
  newMessage.value = ''
  chatMessages.value = getMessagesByChat(selectedChat.value.id)
  
  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  const messagesArea = document.querySelector('.messages-area') as HTMLElement
  if (messagesArea) {
    messagesArea.scrollTop = messagesArea.scrollHeight
  }
}

const startChatWithUser = (user: any) => {
  const chat = getOrCreateDirectChat(
    currentUserId.value,
    user.id,
    authStore.userDisplayName,
    user.name,
    authStore.userRole,
    user.role
  )
  
  selectedChat.value = chat
  chatMessages.value = getMessagesByChat(chat.id)
  showNewMessageModal.value = false
  
  nextTick(() => {
    scrollToBottom()
  })
}

const attachFile = () => {
  console.log('Attach file')
}

const openImageModal = (imageUrl: string) => {
  selectedImage.value = imageUrl
  showImageModal.value = true
}

const getReplySender = (messageId: string) => {
  const message = chatMessages.value.find(m => m.id === messageId)
  return message?.senderId === currentUserId.value ? 'Вы' : 'Другой пользователь'
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Initialize chat system
  if (userChats.value.length > 0) {
    selectChat(userChats.value[0])
  }
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f5f2;
  padding-top: calc(80px + 2rem);
}

.page-header {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  padding: 2rem;
  padding-top: 4.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.chat-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.025em;
}

.chat-subtitle {
  font-size: 1.125rem;
  opacity: 0.95;
  font-weight: 400;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.chat-interface {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chat-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.chat-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  padding-top: 4.5rem;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.inbox-nav {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.inbox-nav::-webkit-scrollbar {
  display: none;
}

.inbox-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e5e7eb;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.2s ease;
  color: #666;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.inbox-nav-btn:hover {
  background: rgba(243, 244, 246, 0.8);
  color: #374151;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.inbox-nav-btn.active {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  font-weight: 600;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(26, 58, 107, 0.3);
}

.inbox-nav-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(26, 58, 107, 0.4);
}

.inbox-nav-btn .icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.nav-badge {
  background: #dc2626;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-weight: 600;
  margin-left: 0.25rem;
}

.chat-search {
  position: relative;
  margin: 0 1rem 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1a3a6b;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

/* Floating Action Buttons */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  pointer-events: none;
  z-index: 1000;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  pointer-events: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.new-message-fab {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
}

.new-message-fab:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(26, 58, 107, 0.4);
}

.go-back-fab {
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.go-back-fab:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.message-list {
  flex: 1;
  overflow-y: auto;
}

.empty-messages {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  border-bottom: 1px solid #f3f4f6;
}

.message-item:hover {
  background: #f9fafb;
}

.message-item.active {
  background: #e0e7ff;
}

.message-item.unread {
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
}

.message-avatar {
  position: relative;
  margin-right: 0.75rem;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.sender-role-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  border: 2px solid white;
}

.sender-role-badge.admin {
  background: #dc2626;
  color: white;
}

.sender-role-badge.user {
  background: #3b82f6;
  color: white;
}

.sender-role-badge.guide {
  background: #f59e0b;
  color: white;
}

.sender-role-badge.business_owner {
  background: #10b981;
  color: white;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.sender-name {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.message-preview {
  font-size: 0.875rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sender-role {
  font-size: 0.75rem;
  color: #9ca3af;
  padding: 0.125rem 0.375rem;
  background: #f3f4f6;
  border-radius: 4px;
}

.read-status {
  color: #10b981;
  font-size: 0.75rem;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-align: center;
}

.no-chat-selected .empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.no-chat-selected h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-user-details {
  flex: 1;
}

.chat-user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.chat-user-status {
  font-size: 0.875rem;
  color: #6b7280;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message.own-message {
  align-self: flex-end;
}

.message-content {
  background: #f3f4f6;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 0.25rem;
}

.own-message .message-content {
  background: #1a3a6b;
  color: white;
}

.reply-preview {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  border-left: 3px solid #1a3a6b;
}

.own-message .reply-preview {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.reply-line {
  width: 2px;
  background: #1a3a6b;
  border-radius: 1px;
}

.own-message .reply-line {
  background: rgba(255, 255, 255, 0.5);
}

.reply-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reply-sender {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a3a6b;
}

.own-message .reply-sender {
  color: rgba(255, 255, 255, 0.8);
}

.reply-text {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.3;
}

.own-message .reply-text {
  color: rgba(255, 255, 255, 0.7);
}

.message-text {
  line-height: 1.4;
  word-wrap: break-word;
}

.message-attachments {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attachment-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.attachment-image:hover {
  transform: scale(1.05);
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-size: 0.875rem;
}

.own-message .attachment-file {
  background: rgba(255, 255, 255, 0.1);
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.own-message .message-meta {
  justify-content: flex-end;
}

.message-time {
  font-size: 0.75rem;
}

.message-status {
  display: flex;
  align-items: center;
}

.read-icon {
  color: #10b981;
}

.sent-icon {
  color: #6b7280;
}

.message-input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.attach-btn {
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
}

.attach-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.message-input-wrapper {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 0.875rem;
  resize: none;
  background: white;
  transition: all 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.send-btn {
  padding: 0.75rem;
  background: #1a3a6b;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.send-btn:hover:not(:disabled) {
  background: #2c5282;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.modal-overlay {
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.user-search {
  margin-bottom: 1rem;
}

.user-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
  border-left: 3px solid #1a3a6b;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.user-item:hover {
  background: #f9fafb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.user-role {
  font-size: 0.875rem;
  color: #666;
}

.image-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-sidebar {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .chat-sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .chat-sidebar.collapsed {
    width: 100%;
    transform: translateX(-100%);
  }
  
  .message {
    max-width: 85%;
  }
  
  .message-input-area {
    padding: 0.75rem 1rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  /* Mobile Floating Actions */
  .floating-actions {
    bottom: 1rem;
    padding: 0 1rem;
  }

  .fab {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  /* Mobile Chat Page */
  .chat-page {
    padding-top: calc(80px + 1rem);
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1rem;
    padding-top: 3rem;
  }
  
  .chat-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .chat-subtitle {
    font-size: 1rem;
  }
  
  .message-input-area {
    gap: 0.5rem;
  }
  
  .message-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
