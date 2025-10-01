<template>
  <div class="business-panel">
    <div class="panel-page-header">
      <div class="panel-page-content">
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-item">
            <Icon icon="mdi:home" />
            Главная
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Панель бизнеса</span>
        </nav>
        
        <div class="panel-welcome">
          <h1 class="panel-title">Панель бизнеса</h1>
          <p class="panel-subtitle">Добро пожаловать, {{ authStore.userDisplayName }}!</p>
        </div>
      </div>
    </div>

    <div class="panel-nav">
      <button 
        v-for="tab in businessTabs" 
        :key="tab.id"
        :class="['panel-nav-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <Icon :icon="tab.icon" />
        <span>{{ tab.name }}</span>
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="panel-content">
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <div class="section-header">
          <h2>Обзор бизнеса</h2>
          <p>Статистика и быстрые действия</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:map-marker" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ businessAttractions.length }}</div>
              <div class="stat-label">Достопримечательности</div>
              <div class="stat-trend" v-if="businessAttractions.length > 0">
                <Icon icon="mdi:trending-up" class="trend-icon" />
                <span class="trend-text">+{{ Math.floor(businessAttractions.length * 0.3) }} за месяц</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:calendar-plus" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ businessEvents.length }}</div>
              <div class="stat-label">События</div>
              <div class="stat-upcoming" v-if="businessEvents.length > 0">
                <span class="upcoming-text">{{ getUpcomingEvents() }} предстоящих</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:calendar-check" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ reservations.length }}</div>
              <div class="stat-label">Бронирования</div>
              <div class="stat-confirmed" v-if="reservations.length > 0">
                <Icon icon="mdi:check-circle" class="confirmed-icon" />
                <span class="confirmed-text">{{ getConfirmedReservations() }} подтверждено</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:currency-rub" class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0)) }}</div>
              <div class="stat-label">Доходы</div>
              <div class="stat-revenue" v-if="payments.length > 0">
                <Icon icon="mdi:trending-up" class="revenue-icon" />
                <span class="revenue-text">+{{ formatCurrency(getMonthlyRevenue()) }} за месяц</span>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <h3>Аналитика</h3>
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-header">
                <h4>Доходы по месяцам</h4>
                <Icon icon="mdi:chart-line" class="chart-icon" />
              </div>
              <div class="chart-placeholder">
                <div class="chart-bars">
                  <div v-for="(month, index) in getMonthlyData()" :key="index" class="chart-bar">
                    <div class="bar" :style="{ height: `${month.amount / 1000}px` }"></div>
                    <span class="bar-label">{{ month.label }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-card">
              <div class="chart-header">
                <h4>Популярные достопримечательности</h4>
                <Icon icon="mdi:chart-pie" class="chart-icon" />
              </div>
              <div class="chart-placeholder">
                <div class="popular-attractions">
                  <div v-for="attraction in getTopAttractions()" :key="attraction.id" class="attraction-item">
                    <div class="attraction-bar">
                      <div class="bar-fill" :style="{ width: `${attraction.visits}%` }"></div>
                    </div>
                    <span class="attraction-name">{{ attraction.name }}</span>
                    <span class="attraction-count">{{ attraction.visits }} посещений</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="notifications-section" v-if="getNotifications().length > 0">
          <h3>Уведомления</h3>
          <div class="notifications-list">
            <div v-for="notification in getNotifications()" :key="notification.id" class="notification-item">
              <div class="notification-icon" :class="notification.type">
                <Icon :icon="notification.icon" />
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatDate(notification.time) }}</div>
              </div>
              <button class="notification-action" @click="handleNotification(notification)">
                <Icon icon="mdi:check" />
              </button>
            </div>
          </div>
        </div>

        <div class="quick-actions-section">
          <h3>Быстрые действия</h3>
          <div class="quick-actions-grid">
            <button class="action-btn" @click="showCreateAttractionModal = true">
              <Icon icon="mdi:plus" class="action-icon" />
              <span>Создать достопримечательность</span>
            </button>
            <button class="action-btn" @click="showCreateEventModal = true">
              <Icon icon="mdi:calendar-plus" class="action-icon" />
              <span>Создать событие</span>
            </button>
            <button class="action-btn" @click="showQRCodeModal = true">
              <Icon icon="mdi:qrcode" class="action-icon" />
              <span>Генерировать QR-код</span>
            </button>
            <button class="action-btn" @click="showPaymentModal = true">
              <Icon icon="mdi:credit-card" class="action-icon" />
              <span>Обработать платеж</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'attractions'" class="tab-content">
        <div class="section-header">
          <h2>Достопримечательности</h2>
          <p>Создавайте и управляйте вашими достопримечательностями</p>
          <button class="section-action" @click="showCreateAttractionModal = true">
            <Icon icon="mdi:plus" />
            Создать достопримечательность
          </button>
        </div>

        <div v-if="businessAttractions.length === 0" class="empty-state">
          <Icon icon="mdi:map-marker-outline" class="empty-icon" />
          <h3>Нет достопримечательностей</h3>
          <p>Создайте вашу первую достопримечательность</p>
        </div>

        <div v-else class="attractions-grid">
          <div v-for="attraction in businessAttractions" :key="attraction.id" class="attraction-card">
            <div class="attraction-header">
              <h3 class="attraction-name">{{ attraction.name }}</h3>
              <div class="attraction-status" :class="attraction.status">
                {{ getAttractionStatusLabel(attraction.status) }}
              </div>
            </div>
            
            <div class="attraction-info">
              <p class="attraction-description">{{ attraction.description }}</p>
              
              <div class="attraction-details">
                <div class="detail-item">
                  <Icon icon="mdi:tag" />
                  <span>{{ attraction.category }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:map-marker" />
                  <span>{{ attraction.city }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:currency-rub" />
                  <span>{{ attraction.price }} ₽</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:account-group" />
                  <span>до {{ attraction.capacity }} человек</span>
                </div>
              </div>
            </div>
            
            <div class="attraction-actions">
              <button class="action-btn secondary" @click="editAttraction(attraction.id)">
                <Icon icon="mdi:pencil" />
                Редактировать
              </button>
              <button class="action-btn primary" @click="viewAttractionDetails(attraction.id)">
                <Icon icon="mdi:eye" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'events'" class="tab-content">
        <div class="section-header">
          <h2>Управление событиями</h2>
          <p>Создавайте и управляйте событиями для привлечения клиентов</p>
        </div>

        <div class="event-actions">
          <button @click="createNewEvent" class="action-btn primary">
            <Icon icon="mdi:plus" />
            Создать событие
          </button>
          <button @click="importEvent" class="action-btn secondary">
            <Icon icon="mdi:import" />
            Импортировать
          </button>
        </div>

        <div v-if="businessEvents.length === 0" class="empty-state">
          <Icon icon="mdi:calendar-plus" class="empty-icon" />
          <h3>Нет событий</h3>
          <p>Создайте ваше первое событие для привлечения клиентов</p>
        </div>

        <div v-else class="events-grid">
          <div v-for="event in businessEvents" :key="event.id" class="event-card">
            <div class="event-header">
              <h3 class="event-title">{{ event.title }}</h3>
              <div class="event-status" :class="{ active: event.isActive }">
                {{ event.isActive ? 'Активно' : 'Неактивно' }}
              </div>
            </div>
            
            <div class="event-info">
              <p class="event-description">{{ event.description }}</p>
              
              <div class="event-details">
                <div class="detail-item">
                  <Icon icon="mdi:calendar" />
                  <span>{{ formatDate(event.date) }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:clock" />
                  <span>{{ event.time }}</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:account-group" />
                  <span>до {{ event.maxParticipants }} человек</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:map-marker" />
                  <span>{{ event.location }}</span>
                </div>
                <div v-if="event.price" class="detail-item">
                  <Icon icon="mdi:currency-rub" />
                  <span>{{ event.price }} ₽</span>
                </div>
              </div>
              
              <div class="event-category">
                <Icon icon="mdi:tag" />
                <span>{{ event.category }}</span>
              </div>
            </div>
            
            <div class="event-stats">
              <div class="stat-item">
                <span class="stat-number">{{ getEventRegistrations(event.id) }}</span>
                <span class="stat-label">Зарегистрировано</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ getEventRevenue(event.id) }} ₽</span>
                <span class="stat-label">Доход</span>
              </div>
            </div>
            
            <div class="event-actions">
              <button @click="editEvent(event.id)" class="action-btn secondary">
                <Icon icon="mdi:pencil" />
                Редактировать
              </button>
              <button @click="viewRegistrations(event.id)" class="action-btn primary">
                <Icon icon="mdi:account-group" />
                Участники
              </button>
              <button @click="toggleEventStatus(event.id)" class="action-btn" :class="event.isActive ? 'danger' : 'success'">
                <Icon :icon="event.isActive ? 'mdi:pause' : 'mdi:play'" />
                {{ event.isActive ? 'Приостановить' : 'Активировать' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'reservations'" class="tab-content">
        <div class="section-header">
          <h2>Бронирования услуг</h2>
          <p>Управляйте бронированиями ваших услуг</p>
        </div>

        <div class="reservation-filters">
          <select v-model="reservationFilter" class="filter-select">
            <option value="all">Все бронирования</option>
            <option value="pending">Ожидают подтверждения</option>
            <option value="confirmed">Подтверждённые</option>
            <option value="completed">Завершённые</option>
            <option value="cancelled">Отменённые</option>
          </select>
          <input 
            v-model="reservationSearch" 
            type="text" 
            placeholder="Поиск по клиенту..." 
            class="search-input"
          />
        </div>

        <div v-if="filteredReservations.length === 0" class="empty-state">
          <Icon icon="mdi:calendar-outline" class="empty-icon" />
          <h3>Нет бронирований</h3>
          <p>Пока нет бронирований по выбранному фильтру</p>
        </div>

        <div v-else class="reservations-list">
          <div v-for="reservation in filteredReservations" :key="reservation.id" class="reservation-card">
            <div class="reservation-header">
              <div class="reservation-status" :class="reservation.status">
                <Icon :icon="getStatusIcon(reservation.status)" />
                <span>{{ getStatusLabel(reservation.status) }}</span>
              </div>
              <div class="reservation-date">
                {{ formatDate(reservation.date) }} в {{ reservation.time }}
              </div>
            </div>
            
            <div class="reservation-info">
              <h3 class="reservation-title">{{ reservation.serviceName }}</h3>
              <div class="client-info">
                <div class="client-name">
                  <Icon icon="mdi:account" />
                  <span>{{ reservation.userName }}</span>
                </div>
                <div class="client-contact">
                  <Icon icon="mdi:phone" />
                  <a :href="`tel:${reservation.userMobile}`">{{ reservation.userMobile }}</a>
                </div>
                <div v-if="reservation.userEmail" class="client-contact">
                  <Icon icon="mdi:email" />
                  <a :href="`mailto:${reservation.userEmail}`">{{ reservation.userEmail }}</a>
                </div>
              </div>
              
              <div class="reservation-details">
                <div class="detail-item">
                  <Icon icon="mdi:account-group" />
                  <span>{{ reservation.participants }} человек</span>
                </div>
                <div class="detail-item">
                  <Icon icon="mdi:clock" />
                  <span>{{ reservation.duration }} минут</span>
                </div>
                <div v-if="reservation.totalPrice" class="detail-item">
                  <Icon icon="mdi:currency-rub" />
                  <span>{{ reservation.totalPrice }} ₽</span>
                </div>
              </div>
            </div>
            
            <div class="reservation-actions">
              <div v-if="reservation.status === 'pending'" class="pending-actions">
                <button @click="confirmReservation(reservation.id)" class="action-btn success">
                  <Icon icon="mdi:check" />
                  Подтвердить
                </button>
                <button @click="rejectReservation(reservation.id)" class="action-btn danger">
                  <Icon icon="mdi:close" />
                  Отклонить
                </button>
              </div>
              
              <div v-if="reservation.status === 'confirmed'" class="confirmed-actions">
                <button @click="markCompleted(reservation.id)" class="action-btn primary">
                  <Icon icon="mdi:check-circle" />
                  Завершить
                </button>
              </div>
              
              <button @click="viewReservationDetails(reservation.id)" class="action-btn outline">
                <Icon icon="mdi:eye" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'profile'" class="tab-content">
        <div class="section-header">
          <h2>Профиль бизнеса</h2>
          <p>Управление информацией о вашем бизнесе</p>
        </div>

        <div class="business-form">
          <div class="form-section">
            <h3>Основная информация</h3>
            <div class="form-group">
              <label>Название бизнеса</label>
              <input v-model="businessForm.businessName" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>Тип бизнеса</label>
              <select v-model="businessForm.businessType" class="form-input">
                <option value="restaurant">Ресторан</option>
                <option value="cafe">Кафе</option>
                <option value="bar">Бар</option>
                <option value="hotel">Отель</option>
                <option value="rental">Аренда</option>
                <option value="workshop">Мастерская</option>
                <option value="entertainment">Развлечения</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="businessForm.description" class="form-input" rows="4"></textarea>
            </div>
            <div class="form-group">
              <label>Местоположение</label>
              <input v-model="businessForm.location" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>Веб-сайт</label>
              <input v-model="businessForm.website" type="url" class="form-input" />
            </div>
          </div>

          <div class="form-section">
            <h3>Социальные сети</h3>
            <div class="form-group">
              <label>Instagram</label>
              <input v-model="businessForm.socialMedia.instagram" type="text" class="form-input" placeholder="@username" />
            </div>
            <div class="form-group">
              <label>Facebook</label>
              <input v-model="businessForm.socialMedia.facebook" type="text" class="form-input" placeholder="facebook.com/username" />
            </div>
            <div class="form-group">
              <label>Telegram</label>
              <input v-model="businessForm.socialMedia.telegram" type="text" class="form-input" placeholder="@username" />
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveBusinessProfile" class="action-btn primary">
              <Icon icon="mdi:content-save" />
              Сохранить изменения
            </button>
            <button @click="previewBusinessProfile" class="action-btn secondary">
              <Icon icon="mdi:eye" />
              Предварительный просмотр
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'analytics'" class="tab-content">
        <div class="section-header">
          <h2>Аналитика бизнеса</h2>
          <p>Статистика и аналитика вашего бизнеса</p>
        </div>

        <div class="analytics-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:calendar-check" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ businessStats.totalEvents }}</div>
              <div class="stat-label">Всего событий</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:account-group" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ businessStats.totalParticipants }}</div>
              <div class="stat-label">Участников</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:currency-rub" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ businessStats.totalRevenue }} ₽</div>
              <div class="stat-label">Общий доход</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:star" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ businessStats.averageRating }}</div>
              <div class="stat-label">Средняя оценка</div>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <h3>Доходы по месяцам</h3>
          <div class="chart-placeholder">
            <Icon icon="mdi:chart-line" class="chart-icon" />
            <p>График доходов</p>
          </div>
        </div>

        <div class="chart-section">
          <h3>Популярные события</h3>
          <div class="popular-events">
            <div v-for="event in popularEvents" :key="event.id" class="popular-event">
              <div class="event-name">{{ event.name }}</div>
              <div class="event-participants">{{ event.participants }} участников</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'qr-codes'" class="tab-content">
        <div class="section-header">
          <h2>QR-коды</h2>
          <p>Генерируйте QR-коды для бронирований</p>
          <button class="section-action" @click="showQRCodeModal = true">
            <Icon icon="mdi:qrcode-plus" />
            Генерировать QR-код
          </button>
        </div>

        <div v-if="qrCodes.length === 0" class="empty-state">
          <Icon icon="mdi:qrcode-outline" class="empty-icon" />
          <h3>Нет QR-кодов</h3>
          <p>Сгенерируйте QR-коды для ваших бронирований</p>
        </div>

        <div v-else class="qr-codes-list">
          <div v-for="qrCode in qrCodes" :key="qrCode.id" class="qr-code-card">
            <div class="qr-code-header">
              <h3 class="qr-code-title">QR-код для бронирования</h3>
              <div class="qr-code-status" :class="{ used: qrCode.isUsed }">
                {{ qrCode.isUsed ? 'Использован' : 'Активен' }}
              </div>
            </div>
            
            <div class="qr-code-info">
              <div class="detail-item">
                <Icon icon="mdi:account-group" />
                <span>{{ qrCode.guestCount }} гостей</span>
              </div>
              <div class="detail-item">
                <Icon icon="mdi:calendar" />
                <span>{{ formatDate(qrCode.visitDate) }}</span>
              </div>
              <div class="detail-item">
                <Icon icon="mdi:clock" />
                <span>{{ qrCode.visitTime }}</span>
              </div>
            </div>
            
            <div class="qr-code-actions">
              <button class="action-btn primary" @click="downloadQRCode(qrCode.id)">
                <Icon icon="mdi:download" />
                Скачать
              </button>
              <button class="action-btn secondary" @click="printQRCode(qrCode.id)">
                <Icon icon="mdi:printer" />
                Печать
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'payments'" class="tab-content">
        <div class="section-header">
          <h2>Платежи</h2>
          <p>Управление платежами и транзакциями</p>
          <button class="section-action" @click="showPaymentModal = true">
            <Icon icon="mdi:credit-card-plus" />
            Обработать платеж
          </button>
        </div>

        <div v-if="payments.length === 0" class="empty-state">
          <Icon icon="mdi:credit-card-outline" class="empty-icon" />
          <h3>Нет платежей</h3>
          <p>Обрабатывайте платежи от ваших клиентов</p>
        </div>

        <div v-else class="payments-list">
          <div v-for="payment in payments" :key="payment.id" class="payment-card">
            <div class="payment-header">
              <h3 class="payment-title">Платеж #{{ payment.id.slice(-6) }}</h3>
              <div class="payment-status" :class="payment.status">
                {{ getPaymentStatusLabel(payment.status) }}
              </div>
            </div>
            
            <div class="payment-info">
              <div class="detail-item">
                <Icon icon="mdi:currency-rub" />
                <span>{{ payment.amount }} ₽</span>
              </div>
              <div class="detail-item">
                <Icon icon="mdi:credit-card" />
                <span>{{ getPaymentMethodLabel(payment.paymentMethod) }}</span>
              </div>
              <div class="detail-item">
                <Icon icon="mdi:calendar" />
                <span>{{ formatDate(payment.createdAt) }}</span>
              </div>
            </div>
            
            <div class="payment-actions">
              <button v-if="payment.status === 'pending'" class="action-btn success" @click="confirmPayment(payment.id)">
                <Icon icon="mdi:check" />
                Подтвердить
              </button>
              <button class="action-btn outline" @click="viewPaymentDetails(payment.id)">
                <Icon icon="mdi:eye" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'comments'" class="tab-content">
        <div class="section-header">
          <h2>Отзывы</h2>
          <p>Управление отзывами клиентов</p>
        </div>

        <div v-if="comments.length === 0" class="empty-state">
          <Icon icon="mdi:comment-outline" class="empty-icon" />
          <h3>Нет отзывов</h3>
          <p>Отзывы клиентов появятся здесь</p>
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-card">
            <div class="comment-header">
              <div class="comment-user">
                <h4 class="user-name">{{ comment.userName }}</h4>
                <div class="comment-rating">
                  <div class="stars">
                    <Icon 
                      v-for="i in 5" 
                      :key="i" 
                      icon="mdi:star" 
                      :class="{ filled: i <= comment.rating }"
                    />
                  </div>
                </div>
              </div>
              <div class="comment-status" :class="comment.status">
                {{ getCommentStatusLabel(comment.status) }}
              </div>
            </div>
            
            <p class="comment-content">{{ comment.content }}</p>
            
            <div class="comment-footer">
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              <div class="comment-actions">
                <button v-if="comment.status === 'approved'" class="action-btn secondary" @click="replyToComment()">
                  <Icon icon="mdi:reply" />
                  Ответить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'messages'" class="tab-content">
        <div class="section-header">
          <h2>Сообщения</h2>
          <p>Общение с клиентами и гидами</p>
        </div>

        <div class="messages-placeholder">
          <Icon icon="mdi:message-outline" class="placeholder-icon" />
          <h3>Система сообщений</h3>
          <p>Здесь будет отображаться переписка с клиентами и гидами</p>
          <button class="action-btn primary" @click="$router.push('/chat')">
            <Icon icon="mdi:message" />
            Перейти к сообщениям
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCreateAttractionModal" class="modal-overlay" @click="showCreateAttractionModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Создать достопримечательность</h3>
          <button class="modal-close" @click="showCreateAttractionModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createAttraction">
            <div class="form-group">
              <label>Название</label>
              <input v-model="newAttraction.name" type="text" required />
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="newAttraction.description" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>Категория</label>
              <select v-model="newAttraction.category" required>
                <option value="">Выберите категорию</option>
                <option value="restaurant">Ресторан</option>
                <option value="museum">Музей</option>
                <option value="park">Парк</option>
                <option value="monument">Памятник</option>
                <option value="entertainment">Развлечения</option>
              </select>
            </div>
            <div class="form-group">
              <label>Город</label>
              <input v-model="newAttraction.city" type="text" required />
            </div>
            <div class="form-group">
              <label>Адрес</label>
              <input v-model="newAttraction.address" type="text" required />
            </div>
            <div class="form-group">
              <label>Цена (₽)</label>
              <input v-model="newAttraction.price" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label>Вместимость</label>
              <input v-model="newAttraction.capacity" type="number" min="1" required />
            </div>
            <div class="form-group">
              <label>Рабочие часы</label>
              <input v-model="newAttraction.workingHours" type="text" placeholder="Пн-Вс: 10:00-22:00" />
            </div>
            <div class="form-actions">
              <button type="button" @click="showCreateAttractionModal = false">Отмена</button>
              <button type="submit">Создать</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showCreateEventModal" class="modal-overlay" @click="showCreateEventModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Создать событие</h3>
          <button class="modal-close" @click="showCreateEventModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createEvent">
            <div class="form-group">
              <label>Название</label>
              <input v-model="newEvent.title" type="text" required />
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="newEvent.description" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label>Дата</label>
              <input v-model="newEvent.date" type="date" required />
            </div>
            <div class="form-group">
              <label>Время</label>
              <input v-model="newEvent.time" type="time" required />
            </div>
            <div class="form-group">
              <label>Местоположение</label>
              <input v-model="newEvent.location" type="text" required />
            </div>
            <div class="form-group">
              <label>Максимум участников</label>
              <input v-model="newEvent.maxParticipants" type="number" min="1" required />
            </div>
            <div class="form-group">
              <label>Цена (₽)</label>
              <input v-model="newEvent.price" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label>Категория</label>
              <select v-model="newEvent.category" required>
                <option value="">Выберите категорию</option>
                <option value="workshop">Мастер-класс</option>
                <option value="tasting">Дегустация</option>
                <option value="concert">Концерт</option>
                <option value="exhibition">Выставка</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="showCreateEventModal = false">Отмена</button>
              <button type="submit">Создать</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showQRCodeModal" class="modal-overlay" @click="showQRCodeModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Генерировать QR-код</h3>
          <button class="modal-close" @click="showQRCodeModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="generateQRCodeForReservation">
            <div class="form-group">
              <label>Бронирование</label>
              <select v-model="newQRCode.reservationId" required>
                <option value="">Выберите бронирование</option>
                <option v-for="reservation in reservations" :key="reservation.id" :value="reservation.id">
                  {{ reservation.serviceName }} - {{ reservation.userName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Количество гостей</label>
              <input v-model="newQRCode.guestCount" type="number" min="1" required />
            </div>
            <div class="form-group">
              <label>Дата посещения</label>
              <input v-model="newQRCode.visitDate" type="date" required />
            </div>
            <div class="form-group">
              <label>Время посещения</label>
              <input v-model="newQRCode.visitTime" type="time" required />
            </div>
            <div class="form-actions">
              <button type="button" @click="showQRCodeModal = false">Отмена</button>
              <button type="submit">Генерировать</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showPaymentModal" class="modal-overlay" @click="showPaymentModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Обработать платеж</h3>
          <button class="modal-close" @click="showPaymentModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="processPayment">
            <div class="form-group">
              <label>Бронирование</label>
              <select v-model="newPayment.reservationId" required>
                <option value="">Выберите бронирование</option>
                <option v-for="reservation in reservations" :key="reservation.id" :value="reservation.id">
                  {{ reservation.serviceName }} - {{ reservation.userName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Сумма (₽)</label>
              <input v-model="newPayment.amount" type="number" min="0" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Способ оплаты</label>
              <select v-model="newPayment.paymentMethod" required>
                <option value="card">Карта</option>
                <option value="bank_transfer">Банковский перевод</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="showPaymentModal = false">Отмена</button>
              <button type="submit">Обработать</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { 
  getReservationsByProvider,
  updateReservationStatus,
  getBusinessEvents,
  getBusinessAttractions,
  addBusinessAttraction,
  getQRCodes,
  generateQRCode,
  getPayments,
  createPayment,
  updatePayment,
  getComments,
  type Reservation,
  type BusinessEvent,
  type BusinessAttraction,
  type QRCode,
  type Payment,
  type Comment
} from '../../Data'
import { Icon } from '@iconify/vue'

const authStore = useAuthStore()

// Tab management
const activeTab = ref('dashboard')
const businessTabs = ref([
  { id: 'dashboard', name: 'Обзор', icon: 'mdi:view-dashboard', badge: null as string | null },
  { id: 'attractions', name: 'Достопримечательности', icon: 'mdi:map-marker', badge: null as string | null },
  { id: 'events', name: 'События', icon: 'mdi:calendar-plus', badge: null as string | null },
  { id: 'reservations', name: 'Бронирования', icon: 'mdi:calendar', badge: null as string | null },
  { id: 'qr-codes', name: 'QR-коды', icon: 'mdi:qrcode', badge: null as string | null },
  { id: 'payments', name: 'Платежи', icon: 'mdi:credit-card', badge: null as string | null },
  { id: 'comments', name: 'Отзывы', icon: 'mdi:comment-text', badge: null as string | null },
  { id: 'messages', name: 'Сообщения', icon: 'mdi:message', badge: null as string | null },
  { id: 'profile', name: 'Профиль', icon: 'mdi:store', badge: null as string | null },
  { id: 'analytics', name: 'Аналитика', icon: 'mdi:chart-line', badge: null as string | null }
])

// Data
const businessEvents = ref<BusinessEvent[]>([])
const reservations = ref<Reservation[]>([])
const businessAttractions = ref<BusinessAttraction[]>([])
const qrCodes = ref<QRCode[]>([])
const payments = ref<Payment[]>([])
const comments = ref<Comment[]>([])

// Filters
const reservationFilter = ref('all')
const reservationSearch = ref('')

// Modals
const showCreateAttractionModal = ref(false)
const showCreateEventModal = ref(false)
const showQRCodeModal = ref(false)
const showPaymentModal = ref(false)
const showReplyModal = ref(false)

// Form data
const newAttraction = ref({
  name: '',
  description: '',
  category: '',
  city: '',
  address: '',
  coordinates: [0, 0] as [number, number],
  images: [] as string[],
  price: 0,
  capacity: 0,
  workingHours: '',
  facilities: [] as string[]
})

const newEvent = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  maxParticipants: 0,
  price: 0,
  category: ''
})

const newQRCode = ref({
  reservationId: '',
  guestCount: 1,
  visitDate: '',
  visitTime: ''
})

const newPayment = ref({
  reservationId: '',
  amount: 0,
  paymentMethod: 'card' as 'card' | 'bank_transfer'
})

const replyForm = ref({
  commentId: '',
  content: ''
})

// Business form
const businessForm = ref({
  businessName: '',
  businessType: '',
  description: '',
  location: '',
  website: '',
  socialMedia: {
    instagram: '',
    facebook: '',
    telegram: ''
  }
})

// Statistics
const businessStats = ref({
  totalEvents: 12,
  totalParticipants: 156,
  totalRevenue: 45000,
  averageRating: 4.6
})

const popularEvents = ref([
  { id: '1', name: 'Мастер-класс по кулинарии', participants: 45 },
  { id: '2', name: 'Дегустация вин', participants: 32 },
  { id: '3', name: 'Вечер живой музыки', participants: 28 }
])

// Computed
const filteredReservations = computed(() => {
  let filtered = reservations.value

  if (reservationFilter.value !== 'all') {
    filtered = filtered.filter(r => r.status === reservationFilter.value)
  }

  if (reservationSearch.value) {
    const search = reservationSearch.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.userName.toLowerCase().includes(search) ||
      r.serviceName.toLowerCase().includes(search)
    )
  }

  return filtered
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'mdi:clock-outline',
    confirmed: 'mdi:check-circle',
    cancelled: 'mdi:cancel',
    completed: 'mdi:check-circle-outline',
    rejected: 'mdi:close-circle'
  }
  return icons[status] || 'mdi:help-circle'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено',
    rejected: 'Отклонено'
  }
  return labels[status] || status
}

const getEventRegistrations = (_eventId: string) => {
  // Mock data - in real app, get from API
  return Math.floor(Math.random() * 20) + 5
}

const getEventRevenue = (_eventId: string) => {
  // Mock data - in real app, get from API
  return Math.floor(Math.random() * 50000) + 10000
}

// Enhanced analytics functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const getUpcomingEvents = () => {
  const now = new Date()
  return businessEvents.value.filter(event => new Date(event.date) > now).length
}

const getConfirmedReservations = () => {
  return reservations.value.filter(res => res.status === 'confirmed').length
}

const getMonthlyRevenue = () => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return payments.value
    .filter(payment => {
      const paymentDate = new Date(payment.createdAt)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    .reduce((sum, payment) => sum + payment.amount, 0)
}

const getMonthlyData = () => {
  const months = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthRevenue = payments.value
      .filter(payment => {
        const paymentDate = new Date(payment.createdAt)
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear()
      })
      .reduce((sum, payment) => sum + payment.amount, 0)
    
    months.push({
      label: date.toLocaleDateString('ru-RU', { month: 'short' }),
      amount: monthRevenue
    })
  }
  
  return months
}

const getTopAttractions = () => {
  return businessAttractions.value
    .map(attraction => ({
      id: attraction.id,
      name: attraction.name,
      visits: Math.floor(Math.random() * 100) + 10 // Mock data
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)
}

const getNotifications = () => {
  const notifications = []
  
  // Check for new comments
  const newComments = comments.value.filter(comment => {
    const commentDate = new Date(comment.createdAt)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return commentDate > oneDayAgo
  })
  
  if (newComments.length > 0) {
    notifications.push({
      id: 'new-comments',
      type: 'info',
      icon: 'mdi:comment-text',
      title: 'Новые отзывы',
      message: `${newComments.length} новых отзывов требуют внимания`,
      time: new Date().toISOString()
    })
  }
  
  // Check for pending reservations
  const pendingReservations = reservations.value.filter(res => res.status === 'pending')
  
  if (pendingReservations.length > 0) {
    notifications.push({
      id: 'pending-reservations',
      type: 'warning',
      icon: 'mdi:clock',
      title: 'Ожидающие бронирования',
      message: `${pendingReservations.length} бронирований требуют подтверждения`,
      time: new Date().toISOString()
    })
  }
  
  return notifications
}

const handleNotification = (notification: any) => {
  // Handle notification action
  if (notification.id === 'new-comments') {
    activeTab.value = 'comments'
  } else if (notification.id === 'pending-reservations') {
    activeTab.value = 'reservations'
  }
}

// Attraction management
const createAttraction = () => {
  if (!authStore.user?.id) return
  
  const attraction: Omit<BusinessAttraction, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
    businessId: authStore.user.id,
    businessName: authStore.userDisplayName || 'Бизнес',
    name: newAttraction.value.name,
    description: newAttraction.value.description,
    category: newAttraction.value.category,
    city: newAttraction.value.city,
    address: newAttraction.value.address,
    coordinates: newAttraction.value.coordinates,
    images: newAttraction.value.images,
    price: newAttraction.value.price,
    capacity: newAttraction.value.capacity,
    workingHours: newAttraction.value.workingHours,
    facilities: newAttraction.value.facilities
  }
  
  addBusinessAttraction(attraction)
  showCreateAttractionModal.value = false
  resetNewAttraction()
  loadBusinessAttractions()
}

const resetNewAttraction = () => {
  newAttraction.value = {
    name: '',
    description: '',
    category: '',
    city: '',
    address: '',
    coordinates: [0, 0],
    images: [],
    price: 0,
    capacity: 0,
    workingHours: '',
    facilities: []
  }
}

// Event management
const createEvent = () => {
  if (!authStore.user?.id) return
  
  // For now, just close modal and reset form
  // In a real implementation, this would create the event
  showCreateEventModal.value = false
  resetNewEvent()
  loadBusinessEvents()
}

const resetNewEvent = () => {
  newEvent.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: 0,
    price: 0,
    category: ''
  }
}

const createNewEvent = () => {
  showCreateEventModal.value = true
}

const importEvent = () => {
  console.log('Importing event')
}

// QR Code management
const generateQRCodeForReservation = () => {
  try {
    const qrCode = generateQRCode(
      newQRCode.value.reservationId,
      newQRCode.value.guestCount,
      newQRCode.value.visitDate,
      newQRCode.value.visitTime
    )
    showQRCodeModal.value = false
    resetNewQRCode()
    loadQRCodes()
    console.log('QR Code generated:', qrCode)
  } catch (error) {
    console.error('Error generating QR code:', error)
    alert('Ошибка при генерации QR-кода')
  }
}

const resetNewQRCode = () => {
  newQRCode.value = {
    reservationId: '',
    guestCount: 1,
    visitDate: '',
    visitTime: ''
  }
}

// Payment management
const processPayment = () => {
  if (!authStore.user?.id) return
  
  const payment: Omit<Payment, 'id' | 'createdAt'> = {
    reservationId: newPayment.value.reservationId,
    userId: '', // Will be filled from reservation
    businessId: authStore.user.id,
    amount: newPayment.value.amount,
    currency: 'RUB',
    status: 'pending',
    paymentMethod: newPayment.value.paymentMethod
  }
  
  createPayment(payment)
  showPaymentModal.value = false
  resetNewPayment()
  loadPayments()
}

const resetNewPayment = () => {
  newPayment.value = {
    reservationId: '',
    amount: 0,
    paymentMethod: 'card'
  }
}

// Comment management
const replyToComment = () => {
  if (!authStore.user?.id) return
  
  // This would add a reply to the comment
  // Implementation depends on the CommentReply interface
  showReplyModal.value = false
  resetReplyForm()
  loadComments()
}

const resetReplyForm = () => {
  replyForm.value = {
    commentId: '',
    content: ''
  }
}

// Helper methods for status labels
const getAttractionStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    pending: 'На модерации',
    approved: 'Одобрено',
    rejected: 'Отклонено'
  }
  return labels[status] || status
}

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Ожидает',
    completed: 'Завершен',
    failed: 'Ошибка',
    refunded: 'Возврат'
  }
  return labels[status] || status
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    card: 'Карта',
    bank_transfer: 'Банковский перевод'
  }
  return labels[method] || method
}

const getCommentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'На модерации',
    approved: 'Одобрено',
    rejected: 'Отклонено'
  }
  return labels[status] || status
}

// Action methods
const editAttraction = (attractionId: string) => {
  console.log('Edit attraction:', attractionId)
}

const viewAttractionDetails = (attractionId: string) => {
  console.log('View attraction details:', attractionId)
}

const downloadQRCode = (qrCodeId: string) => {
  console.log('Download QR code:', qrCodeId)
}

const printQRCode = (qrCodeId: string) => {
  console.log('Print QR code:', qrCodeId)
}

const confirmPayment = (paymentId: string) => {
  updatePayment(paymentId, { status: 'completed' })
  loadPayments()
}

const viewPaymentDetails = (paymentId: string) => {
  console.log('View payment details:', paymentId)
}

const editEvent = (eventId: string) => {
  console.log('Editing event:', eventId)
}

const viewRegistrations = (eventId: string) => {
  console.log('Viewing registrations for event:', eventId)
}

const toggleEventStatus = (eventId: string) => {
  console.log('Toggling event status:', eventId)
}

const confirmReservation = (reservationId: string) => {
  updateReservationStatus(reservationId, 'confirmed')
  loadReservations()
}

const rejectReservation = (reservationId: string) => {
  const reason = prompt('Причина отклонения:')
  if (reason) {
    updateReservationStatus(reservationId, 'rejected', reason)
    loadReservations()
  }
}

const markCompleted = (reservationId: string) => {
  updateReservationStatus(reservationId, 'completed')
  loadReservations()
}

const viewReservationDetails = (reservationId: string) => {
  console.log('Viewing reservation details:', reservationId)
}

const saveBusinessProfile = () => {
  console.log('Saving business profile:', businessForm.value)
}

const previewBusinessProfile = () => {
  console.log('Previewing business profile')
}

const loadBusinessEvents = () => {
  if (authStore.user?.id) {
    businessEvents.value = getBusinessEvents(authStore.user.id)
  }
}

const loadReservations = () => {
  if (authStore.user?.id) {
    reservations.value = getReservationsByProvider(authStore.user.id)
  }
}

const loadBusinessAttractions = () => {
  if (authStore.user?.id) {
    businessAttractions.value = getBusinessAttractions(authStore.user.id)
  }
}

const loadQRCodes = () => {
  if (authStore.user?.id) {
    qrCodes.value = getQRCodes()
  }
}

const loadPayments = () => {
  if (authStore.user?.id) {
    payments.value = getPayments(authStore.user.id)
  }
}

const loadComments = () => {
  if (authStore.user?.id) {
    // Get comments for all business attractions
    const attractionIds = businessAttractions.value.map(a => a.id)
    comments.value = getComments().filter(comment => 
      attractionIds.includes(comment.attractionId)
    )
  }
}

const loadBusinessProfile = () => {
  if (authStore.user?.businessInfo) {
    const info = authStore.user.businessInfo
    businessForm.value.businessName = info.businessName
    businessForm.value.businessType = info.businessType
    businessForm.value.description = info.description
    businessForm.value.location = info.location
    businessForm.value.website = info.website || ''
    businessForm.value.socialMedia = {
      instagram: info.socialMedia?.instagram || '',
      facebook: info.socialMedia?.facebook || '',
      telegram: info.socialMedia?.telegram || ''
    }
  }
}

// Initialize data
onMounted(() => {
  loadBusinessEvents()
  loadReservations()
  loadBusinessAttractions()
  loadQRCodes()
  loadPayments()
  loadComments()
  loadBusinessProfile()
  
  // Update badges
  const pendingCount = reservations.value.filter(r => r.status === 'pending').length
  businessTabs.value[3].badge = pendingCount > 0 ? pendingCount.toString() : null
})
</script>

<style scoped>
.business-panel {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f5f2 0%, #e8e5e2 50%, #f0ede8 100%);
}

.panel-page-header {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  border-bottom: none;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.15);
  padding-top: calc(80px + 2rem);
  position: relative;
}

.panel-page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.3s ease;
  font-weight: 500;
}

.breadcrumb-item:hover {
  color: white;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-current {
  color: white;
  font-weight: 600;
}

.panel-welcome {
  text-align: center;
}

.panel-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.panel-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: none;
  padding: 0;
  display: flex;
  gap: 0;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.panel-nav-btn {
  background: none;
  border: none;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  color: #6b7280;
  font-weight: 600;
  border-radius: 20px 20px 0 0;
  position: relative;
}

.panel-nav-btn:hover {
  color: #1a3a6b;
  background: rgba(26, 58, 107, 0.08);
  transform: translateY(-2px);
}

.panel-nav-btn.active {
  color: #1a3a6b;
  background: linear-gradient(135deg, rgba(26, 58, 107, 0.1) 0%, rgba(44, 82, 130, 0.1) 100%);
  border-bottom-color: #1a3a6b;
  box-shadow: 0 4px 15px rgba(26, 58, 107, 0.2);
}

.panel-nav-btn:first-child {
  border-radius: 20px 0 0 0;
}

.panel-nav-btn:last-child {
  border-radius: 0 20px 0 0;
}

.badge {
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

.panel-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: none;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-height: 600px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #666;
  margin: 0;
}

.event-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.event-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-left: 4px solid #10b981;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #fee2e2;
  color: #991b1b;
}

.event-status.active {
  background: #d1fae5;
  color: #065f46;
}

.event-description {
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.event-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.event-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1a3a6b;
  font-weight: 500;
  margin-bottom: 1rem;
}

.event-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a3a6b;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reservation-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 200px;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reservation-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-left: 4px solid #e5e7eb;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reservation-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.reservation-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.reservation-status.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.reservation-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.reservation-status.completed {
  background: #e0e7ff;
  color: #3730a3;
}

.reservation-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.reservation-date {
  color: #666;
  font-size: 0.875rem;
}

.reservation-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.client-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.client-name,
.client-contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.client-contact a {
  color: #1a3a6b;
  text-decoration: none;
}

.client-contact a:hover {
  text-decoration: underline;
}

.reservation-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reservation-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pending-actions,
.confirmed-actions {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn.primary {
  background: #1a3a6b;
  color: white;
}

.action-btn.primary:hover {
  background: #2c5282;
}

.action-btn.secondary {
  background: #6b7280;
  color: white;
}

.action-btn.secondary:hover {
  background: #4b5563;
}

.action-btn.success {
  background: #10b981;
  color: white;
}

.action-btn.success:hover {
  background: #059669;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover {
  background: #dc2626;
}

.action-btn.outline {
  background: transparent;
  color: #1a3a6b;
  border: 1px solid #1a3a6b;
}

.action-btn.outline:hover {
  background: #1a3a6b;
  color: white;
}

.business-form {
  max-width: 800px;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  background: #1a3a6b;
  color: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.chart-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  color: #666;
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.popular-events {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popular-event {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.event-name {
  font-weight: 500;
  color: #333;
}

.event-participants {
  color: #666;
  font-size: 0.875rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .panel-page-header {
    padding-top: calc(80px + 1rem);
  }
  
  .panel-page-content {
    padding: 1rem;
  }
  
  .breadcrumb {
    margin-bottom: 1rem;
    font-size: 0.75rem;
  }
  
  .panel-title {
    font-size: 2rem;
  }
  
  .panel-nav {
    overflow-x: auto;
    border-radius: 8px 8px 0 0;
  }
  
  .panel-nav-btn {
    padding: 0.75rem 1rem;
    white-space: nowrap;
    font-size: 0.875rem;
  }
  
  .panel-content {
    padding: 1rem;
    border-radius: 0 0 8px 8px;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .event-details {
    grid-template-columns: 1fr;
  }
  
  .event-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .event-actions,
  .reservation-actions {
    flex-direction: column;
  }
  
  .pending-actions,
  .confirmed-actions {
    flex-direction: column;
  }
  
  .reservation-filters {
    flex-direction: column;
  }
  
  .reservation-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

/* Dashboard Styles */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 2rem;
}

.quick-actions-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(26, 58, 107, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #1f2937;
  font-weight: 500;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  background: rgba(26, 58, 107, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.15);
  border-color: rgba(26, 58, 107, 0.2);
}

.action-icon {
  font-size: 1.25rem;
  color: #1a3a6b;
}

/* Attractions Grid */
.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.attraction-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.attraction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.attraction-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.attraction-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.attraction-status.pending {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.attraction-status.approved {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.attraction-info {
  margin-bottom: 1rem;
}

.attraction-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.attraction-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attraction-actions {
  display: flex;
  gap: 0.75rem;
}

/* QR Codes and Payments Lists */
.qr-codes-list,
.payments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qr-code-card,
.payment-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.qr-code-card:hover,
.payment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.qr-code-header,
.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.qr-code-title,
.payment-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.qr-code-status,
.payment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.qr-code-status.used {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.payment-status.pending {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.payment-status.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.qr-code-info,
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.qr-code-actions,
.payment-actions {
  display: flex;
  gap: 0.75rem;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.comment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.comment-user {
  flex: 1;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.comment-rating {
  margin-bottom: 0.5rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.stars .icon {
  font-size: 1rem;
  color: #d1d5db;
}

.stars .icon.filled {
  color: #fbbf24;
}

.comment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.comment-status.pending {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.comment-status.approved {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.comment-content {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-date {
  color: #9ca3af;
  font-size: 0.75rem;
}

.comment-actions {
  display: flex;
  gap: 0.75rem;
}

/* Messages Placeholder */
.messages-placeholder {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.placeholder-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.messages-placeholder h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.messages-placeholder p {
  color: #6b7280;
  margin-bottom: 2rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-actions button[type="button"] {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.form-actions button[type="button"]:hover {
  background: rgba(107, 114, 128, 0.2);
}

.form-actions button[type="submit"] {
  background: linear-gradient(135deg, #1a3a6b 0%, #2c5282 100%);
  color: white;
  border: none;
}

.form-actions button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 58, 107, 0.3);
}

/* Enhanced Business Analytics */
.stat-trend,
.stat-upcoming,
.stat-confirmed,
.stat-revenue {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.trend-icon,
.revenue-icon {
  font-size: 0.875rem;
  color: #10b981;
}

.trend-text,
.revenue-text {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.upcoming-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.confirmed-icon {
  font-size: 0.875rem;
  color: #10b981;
}

.confirmed-text {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

/* Analytics Section */
.analytics-section {
  margin: 3rem 0;
}

.analytics-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.chart-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.chart-icon {
  font-size: 1.25rem;
  color: #1a3a6b;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Revenue Chart */
.chart-bars {
  display: flex;
  align-items: end;
  gap: 0.75rem;
  height: 100%;
  width: 100%;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
}

.bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(180deg, #1a3a6b, #2c5282);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: height 0.6s ease;
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Popular Attractions Chart */
.popular-attractions {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attraction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.attraction-bar {
  width: 100px;
  height: 8px;
  background: rgba(26, 58, 107, 0.1);
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a3a6b, #2c5282);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.attraction-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attraction-count {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

/* Notifications Section */
.notifications-section {
  margin: 3rem 0;
}

.notifications-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.notification-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.notification-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.notification-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.625rem;
  color: #9ca3af;
  font-weight: 500;
}

.notification-action {
  width: 32px;
  height: 32px;
  background: rgba(26, 58, 107, 0.1);
  border: 1px solid rgba(26, 58, 107, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #1a3a6b;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notification-action:hover {
  background: rgba(26, 58, 107, 0.15);
  border-color: rgba(26, 58, 107, 0.3);
  transform: scale(1.05);
}

/* Additional Mobile Responsive Styles */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .attractions-grid {
    grid-template-columns: 1fr;
  }

  .attraction-actions,
  .qr-code-actions,
  .payment-actions,
  .comment-actions {
    flex-direction: column;
  }

  /* Mobile Analytics */
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .chart-card {
    padding: 1rem;
  }

  .chart-placeholder {
    height: 150px;
  }

  .chart-bars {
    gap: 0.5rem;
  }

  .bar {
    max-width: 30px;
  }

  .attraction-item {
    gap: 0.75rem;
  }

  .attraction-bar {
    width: 80px;
  }

  .attraction-name {
    font-size: 0.75rem;
  }

  .attraction-count {
    font-size: 0.625rem;
  }

  .notification-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .notification-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .notification-title {
    font-size: 0.75rem;
  }

  .notification-message {
    font-size: 0.625rem;
  }

  .notification-time {
    font-size: 0.5rem;
  }

  .notification-action {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
