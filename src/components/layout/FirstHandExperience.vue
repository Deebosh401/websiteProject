<template>
  <section class="fhe">
    <div class="fhe-header">
      <h2>От первого лица</h2>
      <button class="link" @click="goAll">Все маршруты</button>
    </div>

    <div class="carousel" v-if="featured.length">
      <article
        v-for="t in featured"
        :key="t.id"
        class="feat-card"
        @click="openDetail(t)"
      >
        <div class="feat-media">
          <template v-if="isVideo(t.cover)">
            <video class="feat-img" autoplay muted loop playsinline preload="metadata">
              <source :src="t.cover" type="video/mp4" />
            </video>
          </template>
          <template v-else>
            <img :src="t.cover" class="feat-img" :alt="t.title" loading="lazy" />
          </template>
          <div class="feat-overlay">
            <h3 class="feat-title line-2">{{ t.title }}</h3>
            <div class="feat-meta">
              <span><Icon icon="mdi:clock-outline" /> {{ t.duration }}ч</span>
              <span><Icon icon="mdi:map-marker-distance" /> {{ t.distance }}км</span>
              <span class="diff" :data-diff="t.difficulty">{{ diffLabel(t.difficulty) }}</span>
            </div>
          </div>
        </div>
      </article>

      <button class="feat-create" @click="showCreate = true">
        <span>＋</span><em>Создать маршрут</em>
      </button>
    </div>

    <div class="filters">
      <input v-model="q" class="f-input" type="search" placeholder="Поиск по названию, тегам…" />
      <div class="f-row">
        <select v-model="fDuration" class="f-select">
          <option value="">Длительность</option>
          <option value="0-2">до 2ч</option>
          <option value="2-4">2–4ч</option>
          <option value="4-8">4–8ч</option>
          <option value="8+">8+ ч</option>
        </select>
        <select v-model="fDistance" class="f-select">
          <option value="">Дистанция</option>
          <option value="0-5">до 5км</option>
          <option value="5-10">5–10км</option>
          <option value="10-20">10–20км</option>
          <option value="20+">20+ км</option>
        </select>
        <select v-model="fDifficulty" class="f-select">
          <option value="">Сложность</option>
                          <option value="лёгкий">Лёгкий</option>
                <option value="средний">Средний</option>
                <option value="сложный">Сложный</option>
        </select>
      </div>

      <div class="chip-row">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="chip"
          :class="{ active: fTags.has(tag) }"
          @click="toggleTag(tag)"
        >#{{ tag }}</button>

        <div class="chip-split"></div>

        <button
          v-for="f in facilities"
          :key="f.key"
          class="chip"
          :class="{ active: fFacilities.has(f.key) }"
          @click="toggleFacility(f.key)"
          :title="f.label"
        >
          <Icon :icon="f.icon" /> {{ f.short }}
        </button>
      </div>
    </div>

    <div class="grid">
      <article
        v-for="t in shown"
        :key="t.id"
        class="card"
        @click="openDetail(t)"
      >
        <div class="media">
          <template v-if="isVideo(t.cover)">
            <video class="thumb" autoplay muted loop playsinline preload="metadata">
              <source :src="t.cover" type="video/mp4" />
            </video>
          </template>
          <template v-else>
            <img :src="t.cover" class="thumb" :alt="t.title" loading="lazy" />
          </template>
          <div class="badge-diff" :data-diff="t.difficulty">{{ diffLabel(t.difficulty) }}</div>
          <button
            class="save"
            @click.stop="toggleSave(t.id)"
            :aria-pressed="saved.has(t.id)"
            :title="saved.has(t.id) ? 'В сохранённых' : 'Сохранить'"
          >
            <Icon :icon="saved.has(t.id) ? 'mdi:bookmark' : 'mdi:bookmark-outline'" />
          </button>
        </div>

        <div class="body">
          <h3 class="title line-2">{{ t.title }}</h3>

          <div class="metrics">
            <span><Icon icon="mdi:clock-outline" /> {{ t.duration }}ч</span>
            <span><Icon icon="mdi:map-marker-distance" /> {{ t.distance }}км</span>
            <span class="rate" :title="ratingTitle(t)">⭐ {{ t.ratings.overall.toFixed(1) }}</span>
              <span v-if="t.costs" class="costs-display" :title="getCostsTitle(t.costs)">
                <span v-if="!t.costs || t.costs.amount === 'Бесплатно'">🆓</span>
                <span v-else>💰</span>
              </span>
            <span v-if="t.payment" class="payment" :title="getPaymentTitle(t.payment)">
            <span v-if="t.payment.cash" class="payment-available">💵</span>
            <span v-else class="payment-unavailable">💵</span>
            
            <span v-if="t.payment.card" class="payment-available">💳</span>
            <span v-else class="payment-unavailable">💳</span>
            </span>
          </div>

          <div class="facilities">
            <span v-if="t.facilities.toilets" title="Туалеты"><Icon icon="mdi:toilet" /></span>
            <span v-if="t.facilities.rest" title="Место отдыха"><Icon icon="mdi:bench" /></span>
            <span v-if="t.facilities.playground" title="Детская площадка"><Icon icon="mdi:castle" /></span>
            <span v-if="t.facilities.accessible" title="Доступность"><Icon icon="mdi:wheelchair-accessibility" /></span>
            <span v-if="t.facilities.parking" title="Парковка"><Icon icon="mdi:car" /></span>
            <span v-if="t.facilities.wifi" title="Wi-Fi"><Icon icon="mdi:wifi" /></span>
            <span v-if="t.facilities.cafe" title="Кафе"><Icon icon="mdi:coffee" /></span>
            <span v-if="t.facilities.water" title="Питьевая вода"><Icon icon="mdi:water" /></span>
            <span v-if="t.facilities.shelter" title="Укрытие"><Icon icon="mdi:umbrella" /></span>
            <span v-if="t.facilities.lighting" title="Освещение"><Icon icon="mdi:lightbulb" /></span>
            <span v-if="t.facilities.security" title="Охрана"><Icon icon="mdi:shield" /></span>
          </div>

          <div class="tags">
            <span class="tag" v-for="tag in t.tags.slice(0, 4)" :key="tag">#{{ tag }}</span>
          </div>

          <div class="actions" @click.stop>
            <button class="like" @click="toggleLike(t.id)" :aria-pressed="likes.has(t.id)">
              <Icon :icon="likes.has(t.id) ? 'mdi:heart' : 'mdi:heart-outline'" /> {{ likeCount(t.id) }}
            </button>
            <button class="comment" @click="openDetail(t)">
              <Icon icon="mdi:comment-outline" /> {{ t.comments.length }}
            </button>
            <button class="share" @click="share(t)">
              <Icon icon="mdi:share-variant" />
            </button>

            <div class="owner">
              <img :src="t.owner.avatar" alt="" />
              <span class="owner-name">{{ t.owner.name }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <p v-if="!shown.length" class="empty">Ничего не найдено. Измените фильтры.</p>

    <div class="drawer" v-if="active" @click.self="closeDetail">
      <div class="sheet">
        <div class="sheet-bar"><div class="drag"></div></div>

        <div class="sheet-head">
          <h3 class="sheet-title">{{ active.title }}</h3>

          <div class="sheet-metrics">
            <div class="chip-metric"><Icon icon="mdi:clock-outline" /> {{ active.duration }}ч</div>
            <div class="chip-metric"><Icon icon="mdi:map-marker-distance" /> {{ active.distance }}км</div>
            <div class="chip-metric diff-pill" :data-diff="active.difficulty">{{ diffLabel(active.difficulty) }}</div>
            <div class="chip-metric rating">⭐ {{ active.ratings.overall.toFixed(1) }}</div>
          </div>
        </div>

        <div class="media-slider">
          <div class="media-track">
            <div v-for="(m, i) in active.media" :key="i" class="media-slide" @click="openViewer(m)">
              <template v-if="isVideo(m)">
                <video controls playsinline preload="metadata"><source :src="m" type="video/mp4" /></video>
              </template>
              <template v-else>
                <img :src="m" :alt="active.title + ' media ' + i" loading="lazy" />
              </template>
            </div>
          </div>
        </div>

        <div v-if="active.summary" class="description-section">
          <h4>📝 Описание маршрута</h4>
          <p class="description-text">{{ active.summary }}</p>
        </div>

        <div class="map-box">
          <div ref="mapEl" class="map-frame">
            <div class="map-overlay">
              <div class="map-stats">
                <div class="stat-item">
                  <Icon icon="mdi:map-marker-distance" />
                  <span>{{ active.stops.length }} остановок</span>
                </div>
                <div class="stat-item">
                  <Icon icon="mdi:clock-outline" />
                  <span>{{ active.duration }}ч</span>
                </div>
                <div class="stat-item">
                  <Icon icon="mdi:map-marker-path" />
                  <span>{{ active.distance }}км</span>
                </div>
              </div>
            </div>
          </div>
          <div class="map-hint">
            <Icon icon="mdi:information-outline" />
            Используйте элементы управления карты для навигации
          </div>
        </div>

        <div class="external-maps-section">
          <button class="btn external-maps-btn" @click="showExternalMapsModal = true">
            <Icon icon="mdi:map-marker" />
            <span>Открыть в картах</span>
            <Icon icon="mdi:open-in-new" class="external-icon" />
          </button>
        </div>

        <div class="steps" v-if="active.stops?.length">
          <div class="steps-header">
            <h4>📍 Остановки</h4>
            <div class="steps-count">{{ active.stops.length }} мест</div>
          </div>
          <div class="steps-list">
            <div
              v-for="(s,i) in active.stops"
              :key="i"
              class="step-item"
              @mouseenter="focusPinAt(i)"
              @click="focusPinAt(i)"
            >
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ s.title }}</div>
                <div class="step-note" v-if="s.note">{{ s.note }}</div>
                <div class="step-coordinates" v-if="s.lat && s.lng">
                  {{ s.lat.toFixed(4) }}, {{ s.lng.toFixed(4) }}
                </div>
              </div>
              <div class="step-actions">
                <Icon icon="mdi:map-marker" class="step-icon" />
                <Icon icon="mdi:chevron-right" class="step-arrow" />
              </div>
            </div>
          </div>
        </div>

        <div class="breakdown">
          <div class="breakdown-header">
            <h4>⭐ Оценки</h4>
            <div class="overall-rating">
              <span class="rating-number">{{ active.ratings.overall.toFixed(1) }}</span>
              <span class="rating-label">Общая оценка</span>
            </div>
          </div>
          <div class="rows">
            <div class="row">
              <div class="rating-label">
                <Icon icon="mdi:image" />
                <span>Виды</span>
              </div>
              <div class="bar"><div class="bar-fill" :style="barStyle(active.ratings.scenery)"></div></div>
              <b>{{ active.ratings.scenery.toFixed(1) }}</b>
            </div>
            <div class="row">
              <div class="rating-label">
                <Icon icon="mdi:wheelchair-accessibility" />
                <span>Доступность</span>
              </div>
              <div class="bar"><div class="bar-fill" :style="barStyle(active.ratings.access)"></div></div>
              <b>{{ active.ratings.access.toFixed(1) }}</b>
            </div>
            <div class="row">
              <div class="rating-label">
                <Icon icon="mdi:sofa" />
                <span>Комфорт</span>
              </div>
              <div class="bar"><div class="bar-fill" :style="barStyle(active.ratings.comfort)"></div></div>
              <b>{{ active.ratings.comfort.toFixed(1) }}</b>
            </div>
          </div>
        </div>

        <div class="comments">
          <div class="comments-header">
            <h4>💬 Комментарии</h4>
            <div class="comments-count">{{ active.comments.length }} отзывов</div>
          </div>

          <div class="c-list">
            <div class="c-item" v-for="(c, i) in active.comments" :key="i">
              <img :src="c.user.avatar" />
              <div class="c-body">
                <div class="c-meta">
                  <b>{{ c.user.name }}</b>
                  <span class="c-date">{{ c.date }}</span>
                </div>
                <p class="c-text">{{ c.text }}</p>

                <div v-if="c.media?.length" class="c-media">
                  <div v-for="(m, k) in c.media" :key="k" class="c-thumb" @click="openViewer(m)">
                    <template v-if="isVideo(m)">
                      <video muted><source :src="m" type="video/mp4" /></video>
                    </template>
                    <template v-else>
                      <img :src="m" alt="" />
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="c-form" @submit.prevent>
            <label class="attach">
              <input type="file" multiple accept="image/*,video/*" @change="handleCommentFiles" />
              <Icon icon="mdi:paperclip" />
            </label>
            <input v-model="newComment" type="text" placeholder="Оставьте комментарий…" />
            <button class="btn plane" @click="addComment" :disabled="!newComment.trim() && !pendingCommentMedia.length">
              <Icon icon="mdi:send" />
            </button>
          </div>

          <div v-if="pendingCommentMedia.length" class="attach-previews">
            <div v-for="(m, i) in pendingCommentMedia" :key="i" class="ap-item" @click="openViewer(m)">
              <template v-if="isVideo(m)"><video muted><source :src="m" type="video/mp4" /></video></template>
              <template v-else><img :src="m" alt="" /></template>
            </div>
          </div>
        </div>

        <div class="sheet-actions">
          <button class="btn ghost" @click="closeDetail">Закрыть</button>
          <button class="btn save-btn" @click="toggleSave(active.id)">
            <Icon :icon="saved.has(active.id) ? 'mdi:bookmark' : 'mdi:bookmark-outline'" />
            {{ saved.has(active.id) ? 'Сохранено' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="viewer.src" class="viewer" @click.self="closeViewer">
      <button class="viewer-close" @click="closeViewer"><Icon icon="mdi:close" /></button>
      <div class="viewer-body">
        <template v-if="isVideo(viewer.src)">
          <video controls playsinline autoplay class="viewer-media"><source :src="viewer.src" type="video/mp4" /></video>
        </template>
        <template v-else>
          <img :src="viewer.src" class="viewer-media" alt="" />
        </template>
      </div>
    </div>

    <div class="modal" v-if="showExternalMapsModal" @click.self="showExternalMapsModal=false">
      <div class="panel external-maps-panel">
        <h3>🗺️ Открыть маршрут</h3>
        <p>Выберите, где открыть маршрут:</p>
        
        <div class="maps-options">
          <button class="map-option" @click="openInGoogleMaps">
            <div class="map-icon">🗺️</div>
            <div class="map-info">
              <strong>Google Maps</strong>
              <span>Открыть в браузере</span>
            </div>
          </button>
          
          <button class="map-option" @click="openInYandexMaps">
            <div class="map-icon">🧭</div>
            <div class="map-info">
              <strong>Яндекс.Карты</strong>
              <span>Открыть в браузере</span>
            </div>
          </button>
        </div>

        <div class="panel-actions">
          <button class="btn ghost" @click="showExternalMapsModal=false">Отмена</button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="showCreate" @click.self="showCreate=false" @keydown.esc="showCreate=false">
      <div class="create-panel">
        <div class="create-header">
          <h3>🧭 Создать новый маршрут</h3>
          <button class="close-btn" @click="showCreate=false">
            <Icon icon="mdi:close" />
          </button>
        </div>

        <div class="create-progress">
          <div class="progress-step" :class="{ active: currentStep >= 1 }">
            <div class="step-number">1</div>
            <span>Основная информация</span>
          </div>
          <div class="progress-step" :class="{ active: currentStep >= 2 }">
            <div class="step-number">2</div>
            <span>Остановки</span>
          </div>
          <div class="progress-step" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <span>Удобства</span>
          </div>
          <div class="progress-step" :class="{ active: currentStep >= 4 }">
            <div class="step-number">4</div>
            <span>Медиа</span>
          </div>
        </div>

        <div v-if="currentStep === 1" class="create-step">
          <div class="form-section">
            <h4>📝 Основная информация</h4>
            
            <div class="form-group">
              <label>Название маршрута *</label>
              <input 
                v-model="form.title" 
                placeholder="Например: Прогулка по историческому центру" 
                class="form-input"
                :class="{ 'error': !form.title && currentStep === 1 }"
              />
              <div v-if="!form.title && currentStep === 1" class="error-message">
                Введите название маршрута
              </div>
            </div>

                          <div class="form-row">
                <div class="form-group">
                  <label>Длительность (часы) *</label>
                  <input 
                    v-model="form.duration" 
                    type="number" 
                    min="0" 
                    step="0.5"
                    placeholder="3" 
                    class="form-input"
                    :class="{ 'error': !form.duration && currentStep === 1 }"
                  />
                  <div v-if="!form.duration && currentStep === 1" class="error-message">
                    Введите длительность
                  </div>
                </div>
                <div class="form-group">
                  <label>Расстояние (км) *</label>
                  <input 
                    v-model="form.distance" 
                    type="number" 
                    min="0" 
                    step="0.1"
                    placeholder="5.5" 
                    class="form-input"
                    :class="{ 'error': !form.distance && currentStep === 1 }"
                  />
                  <div v-if="!form.distance && currentStep === 1" class="error-message">
                    Введите расстояние
                  </div>
                </div>
              </div>

            <div class="form-group">
              <label>Сложность *</label>
              <div class="difficulty-selector">
                <button 
                  v-for="diff in ['лёгкий', 'средний', 'сложный'] as const" 
                  :key="diff"
                  class="difficulty-btn"
                  :class="{ active: form.difficulty === diff }"
                  @click="form.difficulty = diff"
                >
                  <Icon :icon="getDifficultyIcon(diff)" />
                  <span>{{ diffLabel(diff) }}</span>
                </button>
              </div>
              <div v-if="!form.difficulty && currentStep === 1" class="error-message">
                Выберите сложность маршрута
              </div>
            </div>

            <div class="form-group">
              <label>Краткое описание</label>
              <textarea 
                v-model="form.summary" 
                placeholder="Расскажите о маршруте..." 
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Теги</label>
              <div class="tags-input-container">
                <input 
                  v-model="tagInput" 
                  @keydown.enter.prevent="addTag" 
                  @focus="showTagSuggestions = true"
                  @blur="handleTagInputBlur"
                  placeholder="Введите тег и нажмите Enter" 
                  class="form-input"
                />
                <div v-if="showTagSuggestions && tagInput.trim() === ''" class="tags-suggestions">
                  <div class="suggestions-header">Популярные теги:</div>
                  <span 
                    v-for="suggestion in tagSuggestions" 
                    :key="suggestion"
                    class="tag-suggestion"
                    @click="addTagFromSuggestion(suggestion)"
                  >
                    #{{ suggestion }}
                  </span>
                </div>
                <div v-if="showTagSuggestions && tagInput.trim() !== ''" class="tags-suggestions">
                  <div class="suggestions-header">Добавить тег:</div>
                  <span 
                    class="tag-suggestion add-custom"
                    @click="addTag"
                  >
                    #{{ tagInput.trim() }}
                  </span>
                </div>
              </div>
              <div v-if="form.tags.length > 0" class="tags-display">
                <span 
                  v-for="(tag, i) in form.tags" 
                  :key="tag" 
                  class="tag-chip"
                  @click="removeTag(i)"
                >
                  #{{ tag }} <Icon icon="mdi:close" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2" class="create-step">
          <div class="form-section">
            <h4>📍 Остановки маршрута</h4>
            <p class="section-description">Добавьте ключевые точки вашего маршрута</p>
            
          <div class="stops-map-container">
              <div class="map-instructions">
                <Icon icon="mdi:map-marker" />
                <span>Кликните на карту, чтобы добавить остановки</span>
                <div class="city-info">
                  <Icon icon="mdi:map-marker-city" />
                  <span>Город: {{ selectedCity }}</span>
                </div>
              </div>
            <div ref="createMapEl" class="create-map-frame"></div>
              
            <div class="map-controls">
                <button class="map-btn-small" @click="addStopFromMap">
                <Icon icon="mdi:map-marker-plus" />
                  Добавить в центре
              </button>
            </div>
          </div>
            
            <div v-if="routeInfoData.show" class="route-info-below">
              <div class="route-info-header">
                <h4>Статистика маршрута</h4>
              </div>
              <div class="route-stats">
                <div class="route-stat">
                  <div class="stat-content">
                    <div class="stat-icon">🚶</div>
                    <div class="stat-details">
                      <div class="stat-value">{{ routeInfoData.distance }}{{ routeInfoData.distance !== 'Расчет...' ? ' км' : '' }}</div>
                      <div class="stat-label">Расстояние пешком</div>
                    </div>
                  </div>
                </div>
                <div class="route-stat">
                  <div class="stat-content">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-details">
                                              <div class="stat-value">{{ routeInfoData.duration }}</div>
                      <div class="stat-label">Время в пути</div>
                    </div>
                  </div>
                </div>
                <div class="route-stat">
                  <div class="stat-content">
                    <div class="stat-icon">📍</div>
                    <div class="stat-details">
                      <div class="stat-value">{{ form.stops.length }}</div>
                      <div class="stat-label">Остановок</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div class="stops-list">
              <div v-if="form.stops.length === 0" class="empty-stops">
                <Icon icon="mdi:map-marker-off" />
                <p>Нет остановок</p>
                <span>Нажмите на карту или кнопку выше, чтобы добавить остановки</span>
              </div>
            <div v-for="(stop, index) in form.stops" :key="index" class="stop-item">
                <div class="stop-header">
              <span class="stop-number">{{ index + 1 }}</span>
                  <button class="remove-stop" @click="removeStop(index)">
                    <Icon icon="mdi:delete" />
                  </button>
              </div>
                <div class="stop-content">
                  <input 
                    v-model="stop.title" 
                    placeholder="Название остановки" 
                    class="stop-title-input"
                  />
                  <textarea 
                    v-model="stop.note" 
                    placeholder="Описание (необязательно)" 
                    class="stop-note-input"
                    rows="2"
                  ></textarea>
                  <div class="stop-coordinates">
                    <span>{{ stop.lat.toFixed(4) }}, {{ stop.lng.toFixed(4) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 3" class="create-step">
          <div class="form-section">
            <h4>🏪 Удобства и оплата</h4>
            <p class="section-description">Укажите доступные удобства и способы оплаты</p>
            
            <div class="facilities-grid">
              <div 
                v-for="facility in facilitiesList" 
                :key="facility.key"
                class="facility-item"
                :class="{ active: form.facilities[facility.key] }"
                @click="toggleFormFacility(facility.key)"
              >
                <Icon :icon="facility.icon" />
                <span>{{ facility.label }}</span>
        </div>
        </div>

            <div class="payment-section">
              <h5>💳 Способы оплаты</h5>
              <div class="payment-options">
                <label class="payment-option">
                  <input type="checkbox" v-model="form.payment.cash" />
                  <div class="payment-content">
                    <Icon icon="mdi:cash" />
                    <span>Наличные</span>
                  </div>
                </label>
                <label class="payment-option">
                  <input type="checkbox" v-model="form.payment.card" />
                  <div class="payment-content">
                    <Icon icon="mdi:credit-card" />
                    <span>Банковская карта</span>
                  </div>
                </label>
              </div>
        </div>

            <div class="costs-section">
              <h5>💰 Затраты</h5>
              <p class="section-description">Укажите расходы для выбранного типа путешественников</p>
              
              <div class="costs-selector">
                <div class="cost-type-selector">
                  <label class="cost-label">
                    <Icon icon="mdi:account-group" />
                    <span>Тип путешественников</span>
        </label>
                  <select v-model="form.costs.selectedType" class="cost-type-select">
                    <option value="">Выберите тип</option>
                                    <option value="для одного">👤 Для одного</option>
                <option value="для семьи">👨‍👩‍👧‍👦 Для семьи</option>
                <option value="для группы">👥 Для группы</option>
                  </select>
                </div>
                
                <div v-if="form.costs.selectedType" class="cost-input-section">
                  <label class="cost-label">
                    <Icon icon="mdi:currency-rub" />
                    <span>Стоимость для {{ getCostTypeLabel(form.costs.selectedType) }}</span>
                  </label>
                  <input 
                    v-model="form.costs.amount" 
                    type="text" 
                    :placeholder="getCostPlaceholder(form.costs.selectedType)"
                    class="cost-amount-field"
                  />
                </div>
              </div>
              
              <div class="costs-notes">
                <textarea 
                  v-model="form.costs.notes" 
                  placeholder="Дополнительная информация о расходах (билеты, входы, экскурсии, и т.д.)"
                  class="costs-notes-field"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="ratings-section">
              <h5>⭐ Начальные оценки</h5>
              <p class="section-description">Установите начальные оценки для вашего маршрута</p>
              
              <div class="ratings-grid">
                <div class="rating-item">
                  <label>Общая оценка</label>
                  <div class="rating-stars">
                    <button 
                      v-for="star in 5" 
                      :key="star"
                      class="star-btn"
                      :class="{ active: form.ratings.overall >= star }"
                      @click="form.ratings.overall = star"
                    >
                      <Icon icon="lucide:star" />
                    </button>
                  </div>
                  <span class="rating-value">{{ form.ratings.overall }}/5</span>
                </div>
                
                <div class="rating-item">
                  <label>Виды</label>
                  <div class="rating-stars">
                    <button 
                      v-for="star in 5" 
                      :key="star"
                      class="star-btn"
                      :class="{ active: form.ratings.scenery >= star }"
                      @click="form.ratings.scenery = star"
                    >
                      <Icon icon="lucide:star" />
                    </button>
                  </div>
                  <span class="rating-value">{{ form.ratings.scenery }}/5</span>
                </div>
                
                <div class="rating-item">
                  <label>Доступность</label>
                  <div class="rating-stars">
                    <button 
                      v-for="star in 5" 
                      :key="star"
                      class="star-btn"
                      :class="{ active: form.ratings.access >= star }"
                      @click="form.ratings.access = star"
                    >
                      <Icon icon="lucide:star" />
                    </button>
                  </div>
                  <span class="rating-value">{{ form.ratings.access }}/5</span>
                </div>
                
                <div class="rating-item">
                  <label>Комфорт</label>
                  <div class="rating-stars">
                    <button 
                      v-for="star in 5" 
                      :key="star"
                      class="star-btn"
                      :class="{ active: form.ratings.comfort >= star }"
                      @click="form.ratings.comfort = star"
                    >
                      <Icon icon="lucide:star" />
                    </button>
                  </div>
                  <span class="rating-value">{{ form.ratings.comfort }}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 4" class="create-step">
          <div class="form-section">
            <h4>📸 Медиафайлы</h4>
            <p class="section-description">Добавьте фото и видео для вашего маршрута</p>
            
            <div class="media-upload-area" @click="triggerFileUpload">
              <input 
                ref="fileInput" 
                type="file" 
                multiple 
                accept="image/*,video/*" 
                @change="handleUpload" 
                class="hidden-input"
              />
              <div class="upload-content">
                <Icon icon="mdi:cloud-upload" />
                <h5>Загрузить медиафайлы</h5>
                <p>Перетащите файлы сюда или нажмите для выбора</p>
                <span>Поддерживаются: JPG, PNG, MP4</span>
              </div>
            </div>
            <div v-if="form.media.length === 0 && currentStep === 4" class="error-message">
              Загрузите хотя бы одно фото или видео
            </div>

            <div v-if="form.media.length > 0" class="media-preview">
              <h5>Загруженные файлы ({{ form.media.length }})</h5>
              <div class="media-grid">
                <div 
                  v-for="(media, index) in form.media" 
                  :key="index"
                  class="media-item"
                >
                  <template v-if="isVideo(media)">
                    <video muted loop><source :src="media" type="video/mp4" /></video>
                  </template>
                  <template v-else>
                    <img :src="media" alt="" />
                  </template>
                  <button class="remove-media" @click="removeMedia(index)">
                    <Icon icon="mdi:close" />
                  </button>
                  <div v-if="index === 0" class="cover-badge">Обложка</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="create-navigation">
          <button 
            v-if="currentStep > 1" 
            class="nav-btn secondary" 
            @click="currentStep--"
          >
            <Icon icon="mdi:chevron-left" />
            Назад
          </button>
          <button 
            v-if="currentStep < 4" 
            class="nav-btn primary" 
            @click="currentStep++"
            :disabled="!canProceed"
          >
            Далее
            <Icon icon="mdi:chevron-right" />
          </button>
          <button 
            v-if="currentStep === 4" 
            class="nav-btn primary" 
            @click="createRoute"
            :disabled="!canCreate"
          >
            <Icon icon="mdi:check" />
            Создать маршрут
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import maplibregl, { Map, Marker, LngLatBounds } from 'maplibre-gl'
import type { LngLatLike, GeoJSONSource,StyleSpecification } from 'maplibre-gl'
import type { LineString, Feature } from 'geojson'
import { 
  allTrails, 
  type Trail, 
  getTrailFacilities, 
  getFacilitiesList, 
  getTagSuggestions,
  getCityCoordinates,
  getCostTypeLabel,
  getCostTypePlaceholder,
  getDifficultyIcon,
  getPaymentTitle,
  buildOSRMUrl,
  buildGoogleDirectionsUrl,
  buildYandexDirectionsUrl
} from '../../Data'

// -------------------- Types --------------------
type Difficulty = 'лёгкий' | 'средний' | 'сложный'
type Stop = { title: string; note?: string; lat: number; lng: number }

// -------------------- Utils --------------------
const isVideo = (src: string) => src.toLowerCase().endsWith('.mp4')
const diffLabel = (d: Difficulty) => d === 'лёгкий' ? 'Лёгкий' : d === 'средний' ? 'Средний' : 'Сложный'
const ratingTitle = (t: Trail) =>
  `Виды: ${t.ratings.scenery.toFixed(1)} • Доступность: ${t.ratings.access.toFixed(1)} • Комфорт: ${t.ratings.comfort.toFixed(1)}`
// getPaymentTitle is now imported from Data.ts

const getCostsTitle = (costs: { selectedType: string; amount: string; notes: string }) => {
  if (!costs.selectedType || !costs.amount) return 'Бесплатно'
  
  const typeLabel = getCostTypeLabel(costs.selectedType)
  const parts = [`${typeLabel}: ${costs.amount}`]
  if (costs.notes) parts.push(costs.notes)
  
  return parts.join(' • ')
}

const getCostPlaceholder = getCostTypePlaceholder

// City coordinates are now imported from Data.ts

// -------------------- Demo data --------------------
// Initialize with some sample trails if empty
if (allTrails.value.length === 0) {
  allTrails.value = [
  {
    id: 1,
    title: 'Прогулка по Канта и Рыбной деревне',
    cover: '/Kaliningrad.jpeg',
    media: ['/Kaliningrad.jpeg', '/Svetlogorsk.jpeg'],
      duration: 3, distance: 4.8, difficulty: 'лёгкий',
    tags: ['история', 'город', 'семейный'],
    facilities: { 
      toilets: true, rest: true, playground: false, accessible: true,
      parking: true, wifi: true, cafe: true, water: true, shelter: false, lighting: true, security: true
    },
      payment: { cash: true, card: true },
      costs: {
        selectedType: 'для одного',
        amount: '300<span class="currency-symbol">₽</span>',
        notes: 'Билеты в музей, вход в парк'
      },
    ratings: { overall: 4.7, scenery: 4.6, access: 4.8, comfort: 4.5 },
    stops: [
      { title: 'Кафедральный собор', note: 'Кантов остров, музыка органа', lat: 54.7100, lng: 20.5072 },
      { title: 'Рыбная деревня', note: 'Мосты и видовые площадки', lat: 54.7095, lng: 20.5137 }
    ],
    comments: [
      { user: { name: 'Анна', avatar: '/guide1.png' }, text: 'Очень уютно вечером!', date: '2025-08-01' }
    ],
    owner: { name: 'Илья', avatar: '/guide2.png' },
    featured: true
  },
  {
    id: 2,
    title: 'Закат в Светлогорске: набережная и парковая тропа',
    cover: '/Svetlogorsk.jpeg',
    media: ['/Svetlogorsk.jpeg'],
      duration: 2.5, distance: 5.2, difficulty: 'средний',
    tags: ['море', 'виды', 'романтика'],
    facilities: { 
      toilets: true, rest: true, playground: true, accessible: false,
      parking: false, wifi: false, cafe: true, water: true, shelter: true, lighting: false, security: false
    },
      payment: { cash: true, card: false },
      costs: {
        selectedType: 'для одного',
        amount: 'Бесплатно',
        notes: 'Прогулка по набережной и парку'
      },
    ratings: { overall: 4.9, scenery: 5.0, access: 4.2, comfort: 4.6 },
    stops: [
      { title: 'Набережная', note: 'Лучшие фото у моря', lat: 54.9431, lng: 20.1565 },
      { title: 'Парк', note: 'Тихие дорожки среди сосен', lat: 54.9439, lng: 20.1438 }
    ],
    comments: [],
    owner: { name: 'Мария', avatar: '/guide3.png' },
    featured: true
    }
  ]
}

const trails = allTrails

const featured = computed(() => trails.value.filter(t => t.featured))

// -------------------- Social (likes/saves) --------------------
const saved = ref<Set<number>>(new Set())
const likes = ref<Set<number>>(new Set())

onMounted(() => {
  const s = localStorage.getItem('fhe_saved'); if (s) saved.value = new Set(JSON.parse(s))
  const l = localStorage.getItem('fhe_likes'); if (l) likes.value = new Set(JSON.parse(l))
  
  // Listen for city changes from header
  window.addEventListener('city:changed', handleCityChange)
})

onUnmounted(() => {
  window.removeEventListener('city:changed', handleCityChange)
})

// Handle city changes from header
function handleCityChange(event: any) {
  const newCity = event.detail
  if (newCity && newCity !== selectedCity.value) {
    selectedCity.value = newCity
    // Update trails to show city-specific content
    // The trails will automatically filter based on the new city
  }
}

const persist = () => {
  localStorage.setItem('fhe_saved', JSON.stringify([...saved.value]))
  localStorage.setItem('fhe_likes', JSON.stringify([...likes.value]))
}
const toggleSave = (id: number) => { saved.value.has(id) ? saved.value.delete(id) : saved.value.add(id); persist() }
const toggleLike = (id: number) => { likes.value.has(id) ? likes.value.delete(id) : likes.value.add(id); persist() }
const likeCount = (id: number) => (likes.value.has(id) ? 1 : 0)

// ---- Fullscreen viewer state & actions (used by the template) ----
const viewer = ref<{ open: boolean; src: string | null; isVideo: boolean }>({
  open: false,
  src: null,
  isVideo: false
})

const openViewer = (src: string) => {
  viewer.value.open = true
  viewer.value.src = src
  viewer.value.isVideo = isVideo(src)
}

const closeViewer = () => {
  viewer.value.open = false
  viewer.value.src = null
  viewer.value.isVideo = false
}


// -------------------- Filters --------------------
const q = ref('')
const fDuration = ref('')                 // "0-2" | "2-4" | "8+"
const fDistance = ref('')                 // "0-5" | "5-10" | "20+"
const fDifficulty = ref<Difficulty | ''>('') 
const fTags = ref<Set<string>>(new Set())
const fFacilities = ref<Set<string>>(new Set())

const allTags = computed(() => {
  const s = new Set<string>()
  trails.value.forEach(t => t.tags.forEach(tag => s.add(tag)))
  return Array.from(s).sort()
})

const facilities = getTrailFacilities()

const matchesRange = (val: number, spec: string) => {
  if (!spec) return true
  if (spec.endsWith('+')) return val >= parseFloat(spec)
  const [a, b] = spec.split('-').map(parseFloat)
  return val >= a && val < b
}

const filtered = computed(() =>
  trails.value.filter(t => {
    const text = `${t.title} ${t.tags.join(' ')}`.toLowerCase()
    const passQ = !q.value || text.includes(q.value.trim().toLowerCase())
    const passDur = matchesRange(t.duration, fDuration.value)
    const passDist = matchesRange(t.distance, fDistance.value)
    const passDiff = !fDifficulty.value || t.difficulty === fDifficulty.value
    const passTags = !fTags.value.size || [...fTags.value].every(tag => t.tags.includes(tag))
    const passFacilities = !fFacilities.value.size || [...fFacilities.value].every(k => (t.facilities as any)[k])
    return passQ && passDur && passDist && passDiff && passTags && passFacilities
  })
)

const shown = computed(() => {
  const arr = [...filtered.value]
  arr.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.ratings.overall - a.ratings.overall)
  return arr
})

const toggleTag = (tag: string) => { fTags.value.has(tag) ? fTags.value.delete(tag) : fTags.value.add(tag) }
const toggleFacility = (key: string) => { fFacilities.value.has(key) ? fFacilities.value.delete(key) : fFacilities.value.add(key) }

// -------------------- Drawer / Detail --------------------
const active = ref<Trail | null>(null)
const newComment = ref('')
const newCommentFiles = ref<File[]>([])
const showExternalMapsModal = ref(false)

const openDetail = (t: Trail) => { active.value = t; newComment.value = ''; newCommentFiles.value = [] }
const closeDetail = () => { active.value = null }

const addComment = () => {
  if (!active.value) return
  const txt = newComment.value.trim()
  if (!txt && newCommentFiles.value.length === 0) return
  const media: string[] = []
  newCommentFiles.value.forEach(f => media.push(URL.createObjectURL(f)))
  active.value.comments.push({
    user: { name: 'Гость', avatar: '/guide2.png' },
    text: txt || '📎 Вложение',
    date: new Date().toISOString().slice(0, 10),
    media
  })
  newComment.value = ''
  newCommentFiles.value = []
}

// -------------------- Share --------------------
const share = async (t: Trail) => {
  const url = location.origin + '/routes/' + t.id
  if ((navigator as any).share) {
    try { await (navigator as any).share({ title: t.title, url }) } catch {}
  } else {
    await navigator.clipboard.writeText(url)
    alert('Ссылка скопирована!')
  }
}

// -------------------- Create route modal --------------------
const showCreate = ref(false)
const currentStep = ref(1)
const fileInput = ref<HTMLInputElement | null>(null)
const showTagSuggestions = ref(false)
const selectedCity = ref<string>(localStorage.getItem('selectedCity') || 'Калининград')

const form = ref({
  title: '',
  duration: '' as string,
  distance: '' as string,
  difficulty: '' as '' | Difficulty,
  summary: '',
  tags: [] as string[],
  facilities: { 
    toilets: false, rest: false, playground: false, accessible: false,
    parking: false, wifi: false, cafe: false, water: false, shelter: false, lighting: false, security: false
  },
  payment: { cash: false, card: false },
  costs: {
    selectedType: '',
    amount: '',
    notes: ''
  },
  ratings: { overall: 5, scenery: 5, access: 5, comfort: 5 },
  media: [] as string[],
  stops: [] as { title: string; note?: string; lat: number; lng: number }[]
})
const tagInput = ref('')

// Helper functions for the new form
// getDifficultyIcon is now imported from Data.ts

const tagSuggestions = getTagSuggestions()

const facilitiesList = getFacilitiesList()

const addTag = () => {
  const v = tagInput.value.trim().toLowerCase()
  if (v && !form.value.tags.includes(v)) form.value.tags.push(v)
  tagInput.value = ''
}

const addTagFromSuggestion = (suggestion: string) => {
  if (!form.value.tags.includes(suggestion)) {
    form.value.tags.push(suggestion)
  }
}

const handleTagInputBlur = () => {
  setTimeout(() => {
    showTagSuggestions.value = false
  }, 200)
}

const removeTag = (i: number) => form.value.tags.splice(i, 1)

const toggleFormFacility = (key: string) => {
  form.value.facilities[key as keyof typeof form.value.facilities] = !form.value.facilities[key as keyof typeof form.value.facilities]
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleUpload = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  files.forEach(f => form.value.media.push(URL.createObjectURL(f)))
}

const removeMedia = (index: number) => {
  form.value.media.splice(index, 1)
}



const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!form.value.title && !!form.value.duration && !!form.value.distance && !!form.value.difficulty
    case 2:
      return true // Stops are optional
    case 3:
      return true // Facilities are optional
    case 4:
      return form.value.media.length > 0
    default:
      return false
  }
})

const canCreate = computed(() => {
  const durationValid = form.value.duration && !isNaN(parseFloat(form.value.duration))
  const distanceValid = form.value.distance && !isNaN(parseFloat(form.value.distance))
  return !!form.value.title && durationValid && distanceValid && !!form.value.difficulty && form.value.media.length > 0
})

// Debug function to test all form elements


const createRoute = () => {
  const id = Math.max(0, ...allTrails.value.map(t => t.id)) + 1
  const cover = form.value.media[0]
  const newTrail: Trail = {
    id,
    title: form.value.title,
    cover,
    media: [...form.value.media],
    duration: parseFloat(form.value.duration),
    distance: parseFloat(form.value.distance),
    difficulty: form.value.difficulty as Difficulty,
    tags: [...form.value.tags],
    facilities: { ...form.value.facilities },
    payment: { ...form.value.payment },
    costs: {
      selectedType: form.value.costs.selectedType as 'для одного' | 'для семьи' | 'для группы',
      amount: form.value.costs.amount,
      notes: form.value.costs.notes
    },
    ratings: { ...form.value.ratings },
    stops: [...form.value.stops],
    comments: [],
    owner: { name: 'Вы', avatar: '/guide1.png' },
    featured: false,
    summary: form.value.summary
  }
  
  allTrails.value.unshift(newTrail)
  
  showCreate.value = false
  currentStep.value = 1
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    duration: '',
    distance: '',
    difficulty: '',
    summary: '',
    tags: [],
    facilities: { 
      toilets: false, rest: false, playground: false, accessible: false,
      parking: false, wifi: false, cafe: false, water: false, shelter: false, lighting: false, security: false
    },
    payment: { cash: false, card: false },
    costs: {
      selectedType: '' as 'для одного' | 'для семьи' | 'для группы' | '',
      amount: '',
      notes: ''
    },
    ratings: { overall: 5, scenery: 5, access: 5, comfort: 5 },
    media: [],
    stops: []
  }
  tagInput.value = ''
}

// -------------------- Navigation --------------------
const router = useRouter()
const route = useRoute()

const goAll = () => {
  // Get current city from route or default to Kaliningrad
  const currentCity = route.params.name || 'Калининград'
  router.push(`/city/${currentCity}/trips`)
}

// -------------------- Map (MapLibre GL JS) --------------------
const mapEl = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let markers: Marker[] = []

const ROUTE_SOURCE_ID = 'route-src'
const ROUTE_LAYER_ID = 'route-line'
const ROUTE_PROGRESS_SOURCE_ID = 'route-progress-src'
const ROUTE_PROGRESS_LAYER_ID = 'route-progress-line'

const makePinEl = (delayMs = 0) => {
  const el = document.createElement('div')
  el.className = 'apple-pin pin-drop'
  el.innerHTML = `<div class="pin-emoji" style="animation-delay:${delayMs}ms">📍</div>`
  return el
}



const cleanupMap = () => {
  if (!map) return
  markers.forEach(m => m.remove())
  markers = []
  if (map.getLayer(ROUTE_PROGRESS_LAYER_ID)) map.removeLayer(ROUTE_PROGRESS_LAYER_ID)
  if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID)
  if (map.getSource(ROUTE_PROGRESS_SOURCE_ID)) map.removeSource(ROUTE_PROGRESS_SOURCE_ID)
  if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID)
  map.remove()
  map = null
}

const MAPTILER_STYLE:StyleSpecification = {
  version: 8,
  sources: {
    maptiler: {
      type: 'raster',
      tiles: ['https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Fuo1P4u5HZvd7RfCDyrP'],
      tileSize: 256,
      attribution: '© MapTiler © OpenStreetMap contributors'
    }
  },
  layers: [
    { id: 'maptiler', type: 'raster', source: 'maptiler' }
  ]
} 

// ---- Distance & helpers ----
type LngLat = [number, number];

function toLngLat(s: { lng: number; lat: number }): LngLat {
  return [s.lng, s.lat];
}

// Haversine (meters)
function haversine(a: LngLat, b: LngLat): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Find index of closest vertex on the route polyline to a given stop
function closestIndexOnRoute(route: LngLat[], stop: LngLat): number {
  let best = 0, bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i < route.length; i++) {
    const d = haversine(route[i], stop);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

// Preprocess route with cumulative meters
function preprocessRoute(route: LngLat[]) {
  const cum: number[] = [0];
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversine(route[i - 1], route[i]);
    cum.push(total);
  }
  return { cum, total };
}

// ---- Fetch a real walking route from OSRM ----

async function fetchOSRMRoute(stops: Stop[]): Promise<LngLat[]> {
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=simplified&geometries=geojson&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM request failed');
  const json = await res.json();
  const line: LngLat[] = json?.routes?.[0]?.geometry?.coordinates ?? [];
  
  // Simplify route for better performance - reduce coordinates by 50%
  if (line.length > 10) {
    const simplified = [];
    for (let i = 0; i < line.length; i += 2) {
      simplified.push(line[i]);
    }
    // Always include the last point
    if (line.length > 1 && simplified[simplified.length - 1] !== line[line.length - 1]) {
      simplified.push(line[line.length - 1]);
    }
    return simplified;
  }
  
  return line;
}

// ---- Animate the blue "snake" line and trigger pins as it passes stops ----
let animationRAF: number | null = null;

function animateSnake(
  route: LngLat[],
  onProgressVertex: (vertexIdx: number) => void,
  metersPerSecond = 200    // Much faster for better performance
) {
  if (!map) return;
  if (animationRAF) cancelAnimationFrame(animationRAF);

  const { cum, total } = preprocessRoute(route);
  const start = performance.now();
  const src = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource;

  let lastVertex = 0;
  let lastBoundsCheck = 0;
  let boundsUpdateInProgress = false;
  let currentZoomLevel = map.getZoom();
  let zoomOutStep = 0.5; // Zoom out by 0.5 levels each time

  const step = (t: number) => {
    const elapsed = (t - start) / 1000;        // seconds
    
    // Smooth easing function for more natural animation
    const easeProgress = 1 - Math.pow(1 - Math.min(elapsed / (total / metersPerSecond), 1), 3);
    const traveled = total * easeProgress;

    // find the last vertex whose cumulative distance <= traveled
    let i = lastVertex;
    while (i < cum.length && cum[i] <= traveled) i++;
    const currVertex = Math.min(i, route.length - 1);

    // Smooth interpolation between vertices
    let smoothRoute = route.slice(0, currVertex + 1);
    
    if (currVertex < route.length - 1 && currVertex > 0) {
      const prevDist = cum[currVertex];
      const nextDist = cum[currVertex + 1];
      const progress = (traveled - prevDist) / (nextDist - prevDist);
      
      if (progress > 0 && progress < 1) {
        const prevPoint = route[currVertex];
        const nextPoint = route[currVertex + 1];
        
        // Linear interpolation between points
        const interpolatedPoint = [
          prevPoint[0] + (nextPoint[0] - prevPoint[0]) * progress,
          prevPoint[1] + (nextPoint[1] - prevPoint[1]) * progress
        ];
        
        smoothRoute.push(interpolatedPoint as LngLat);
      }
    }

    // update polyline with smooth route
    src.setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: smoothRoute },
      properties: {}
    });

    // Update progress layer for smooth animation
    if (map) {
      const progressSrc = map.getSource(ROUTE_PROGRESS_SOURCE_ID) as GeoJSONSource;
      if (progressSrc) {
        progressSrc.setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: smoothRoute },
          properties: {}
        });
      }
    }

    // Progressive bounds checking every 0.3 seconds for better performance
    const timeSinceLastCheck = elapsed - lastBoundsCheck;
    if (timeSinceLastCheck >= 0.3 && !boundsUpdateInProgress && map) {
      const currentPoint = route[currVertex];
      const currentMapBounds = map.getBounds();
      
      // Check if current point is out of bounds
      const margin = 0.001; // Larger margin for step-by-step approach
      const isOutOfBounds = !currentMapBounds.contains(currentPoint);
      const isNearEdge = 
        currentPoint[0] <= currentMapBounds.getWest() + margin ||
        currentPoint[0] >= currentMapBounds.getEast() - margin ||
        currentPoint[1] <= currentMapBounds.getSouth() + margin ||
        currentPoint[1] >= currentMapBounds.getNorth() - margin;

      if (isOutOfBounds || isNearEdge || currVertex === route.length - 1) {
        boundsUpdateInProgress = true;
        
        if (isOutOfBounds || isNearEdge) {
          // Step-by-step zoom OUT to see more of the trail
          const newZoom = Math.max(10, currentZoomLevel - zoomOutStep);
          currentZoomLevel = newZoom;
          
          // Calculate new center to keep trail visible
          const currentCenter = map.getCenter();
          const directionToPoint = [
            currentPoint[0] - currentCenter.lng,
            currentPoint[1] - currentCenter.lat
          ];
          
          // Move center towards the trail point
          const newCenter = [
            currentCenter.lng + directionToPoint[0] * 0.3,
            currentCenter.lat + directionToPoint[1] * 0.3
          ];
          
          // Smooth zoom OUT and center adjustment
          map.easeTo({
            center: newCenter as [number, number],
            zoom: newZoom,
            duration: 800,
            easing: (t) => t * (2 - t)
          });
        } else {
          // Final zoom to fit entire trail with 5% extra space
          const finalBounds = new LngLatBounds();
          route.forEach(coord => finalBounds.extend(coord as LngLatLike));
          
          // Add 5% padding to the bounds
          const lngPadding = (finalBounds.getEast() - finalBounds.getWest()) * 0.05;
          const latPadding = (finalBounds.getNorth() - finalBounds.getSouth()) * 0.05;
          
          finalBounds.extend([finalBounds.getWest() - lngPadding, finalBounds.getSouth() - latPadding]);
          finalBounds.extend([finalBounds.getEast() + lngPadding, finalBounds.getNorth() + latPadding]);
          
          map.fitBounds(finalBounds, {
            padding: { top: 20, bottom: 20, left: 20, right: 20 },
            duration: 1200,
            easing: (t) => t * (2 - t)
          });
        }
        
        map.once('moveend', () => {
          boundsUpdateInProgress = false;
        });
        
        lastBoundsCheck = elapsed;
      }
    }

    // notify when we advance past a new vertex
    if (currVertex > lastVertex) {
      onProgressVertex(currVertex);
      lastVertex = currVertex;
    }

    if (traveled < total) {
      // Use requestAnimationFrame directly for smoother animation
      animationRAF = requestAnimationFrame(step);
    } else {
      animationRAF = null;
    }
  };

  animationRAF = requestAnimationFrame(step);
}


const initMap = async (trail: Trail) => {
  if (!mapEl.value || !trail?.stops?.length) return;

  cleanupMap();

  map = new maplibregl.Map({
    container: mapEl.value,
    style: MAPTILER_STYLE,
    attributionControl: false
  });

  // Enable basic map interactions
  map.scrollZoom.enable();
  map.boxZoom.enable();
  map.dragPan.enable();
  map.keyboard.enable();
  map.doubleClickZoom.enable();
  map.touchZoomRotate.enable();
  // Keep drag rotate disabled for better UX
  map.dragRotate.disable();

  const lnglats: LngLat[] = trail.stops.map(toLngLat);
  const bounds = lnglats.reduce(
    (b, [lng, lat]) => b.extend([lng, lat] as LngLatLike),
    new LngLatBounds(lnglats[0], lnglats[0])
  );

  map.on('load', async () => {

    
    // Add visual enhancements
    map!.addControl(new maplibregl.NavigationControl(), 'top-right');
    map!.addControl(new maplibregl.FullscreenControl(), 'top-right');
    
    // Start with a zoomed-in view of the first stop
    map!.setCenter(lnglats[0]);
    map!.setZoom(14);

    // Add pins with drop animation
    markers.forEach(m => m.remove());
    markers = [];
    

    
    // Drop pins with staggered delay

    for (let i = 0; i < trail.stops.length; i++) {
      const s = trail.stops[i];
      const el = makePinEl(i * 150); // Staggered drop timing
      const mk = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([s.lng, s.lat])
        .addTo(map!);
      el.title = `${s.title}\n${s.note ?? ''}`.trim();
      markers.push(mk);
      
      
      // Remove drop class after animation (Apple-style timing)
      setTimeout(() => {
        el.classList.remove('pin-drop');

        // Add bounce after drop animation completes
        setTimeout(() => {
          el.classList.add('pin-bounce');
          
          setTimeout(() => {
            el.classList.remove('pin-bounce');
            
          }, 800);
        }, 100);
      }, i * 200 + 600);
    }

    // Wait for all pins to drop and bounce, then zoom to fit entire trail
    const totalDropTime = trail.stops.length * 200 + 1500; // All drops + bounce time
    setTimeout(async () => {
      // Start with zoom that shows the entire trail
      map!.fitBounds(bounds, { 
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        duration: 1000,
        easing: (t) => t * (2 - t) // Smooth easing
      });

      // Wait for zoom to complete, then start the snake
      setTimeout(async () => {
        // Prepare route layer
        const emptyLine: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        };

        map!.addSource(ROUTE_SOURCE_ID, {
          type: 'geojson',
          data: emptyLine
        });

        map!.addLayer({
          id: ROUTE_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          paint: {
            'line-color': '#3b82f6',
            'line-width': 6,
            'line-opacity': 0.9,
            'line-blur': 1,
            'line-dasharray': [0, 0]
          }
        });

        // Add a glowing effect layer
        map!.addLayer({
          id: 'route-glow',
          type: 'line',
          source: ROUTE_SOURCE_ID,
          paint: {
            'line-color': '#60a5fa',
            'line-width': 12,
            'line-opacity': 0.3,
            'line-blur': 3
          }
        }, ROUTE_LAYER_ID);

        // Add smooth progress layer
        map!.addSource(ROUTE_PROGRESS_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} }
        });

        map!.addLayer({
          id: ROUTE_PROGRESS_LAYER_ID,
          type: 'line',
          source: ROUTE_PROGRESS_SOURCE_ID,
          paint: {
            'line-color': '#ffffff',
            'line-width': 3,
            'line-opacity': 0.8,
            'line-blur': 0
          }
        }, ROUTE_LAYER_ID);

        // Bind events after the layer exists
        map!.on('click', ROUTE_LAYER_ID, () => showExternalMapsModal.value = true);
        map!.on('mouseenter', ROUTE_LAYER_ID, () => (map!.getCanvas().style.cursor = 'pointer'));
        map!.on('mouseleave', ROUTE_LAYER_ID, () => (map!.getCanvas().style.cursor = ''));

        // Fetch and animate the route with timeout and fallback
        let routed: LngLat[] = [];
        try {
          // Add timeout to prevent stalling
          const routePromise = fetchOSRMRoute(trail.stops);
          const timeoutPromise = new Promise<LngLat[]>((_, reject) => 
            setTimeout(() => reject(new Error('Route fetch timeout')), 3000)
          );
          
          routed = await Promise.race([routePromise, timeoutPromise]);
      
          
          if (!routed.length) throw new Error('Empty route geometry');
        } catch (e) {
          console.warn('OSRM routing failed, using straight segments:', e);
          // Create smooth straight segments with interpolation
          routed = [];
          for (let i = 0; i < trail.stops.length - 1; i++) {
            const start = toLngLat(trail.stops[i]);
            const end = toLngLat(trail.stops[i + 1]);
            
            // Add start point
            if (i === 0) routed.push(start);
            
            // Interpolate intermediate points for smoother animation
            const steps = Math.max(5, Math.floor(haversine(start, end) / 50)); // 50m intervals
            for (let j = 1; j <= steps; j++) {
              const t = j / steps;
              const lng = start[0] + (end[0] - start[0]) * t;
              const lat = start[1] + (end[1] - start[1]) * t;
              routed.push([lng, lat]);
            }
            
            // Add end point
            if (i === trail.stops.length - 2) routed.push(end);
          }
        }

        const stopVertexIdx: number[] = new Array(trail.stops.length).fill(-1);
        for (let s = 0; s < trail.stops.length; s++) {
          stopVertexIdx[s] = closestIndexOnRoute(routed, toLngLat(trail.stops[s]));
        }

        // Animate the snake through the route
        const seen = new Set<number>();
        animateSnake(routed, (vIdx) => {
          // did we pass a stop?
          for (let s = 0; s < stopVertexIdx.length; s++) {
            if (!seen.has(s) && vIdx >= stopVertexIdx[s]) {
              seen.add(s);
              const el = markers[s]?.getElement();
              if (el) {
                el.classList.add('pin-bounce');
                setTimeout(() => el.classList.remove('pin-bounce'), 900);
              }
            }
          }
        }, 400); // Much faster for better performance
      }, 1200); // Wait for zoom to complete
    }, totalDropTime);

    // ensure rendering if container size changes
    setTimeout(() => map?.resize(), 250);
  });
};

const focusPinAt = (idx: number) => {
  const m = markers[idx]; if (!m || !map) return;
  const ll = m.getLngLat();
  map.easeTo({ center: ll, duration: 500, zoom: Math.max(map.getZoom(), 15) });
  pulsePinAt(idx);
};

// Track which pin is currently vibrating
let vibratingPinIdx: number | null = null;

const pulsePinAt = (idx: number) => {
  // Stop previous vibrating pin
  if (vibratingPinIdx !== null && vibratingPinIdx !== idx) {
    const prevM = markers[vibratingPinIdx];
    if (prevM) {
      const prevEl = prevM.getElement();
      prevEl.classList.remove('pin-vibrate', 'pin-pulsate');
    }
  }
  
  const m = markers[idx];
  if (!m) return;
  
  const el = m.getElement();
  vibratingPinIdx = idx;
  
  // Start with vibration for 1 second
  el.classList.add('pin-vibrate');
  setTimeout(() => {
    if (vibratingPinIdx === idx) {
      el.classList.remove('pin-vibrate');
      // Then switch to pulsation for 2 seconds
      el.classList.add('pin-pulsate');
      setTimeout(() => {
        if (vibratingPinIdx === idx) {
          el.classList.remove('pin-pulsate');
          vibratingPinIdx = null;
        }
      }, 2000);
    }
  }, 1000);
};


const openInGoogleMaps = () => {
  if (!active.value?.stops?.length) return;
  const pts = active.value.stops.map(s => `${s.lat},${s.lng}`);
  const google = buildGoogleDirectionsUrl(pts[0], pts[pts.length-1], pts.slice(1,-1));
  window.open(google, '_blank');
  showExternalMapsModal.value = false;
};

const openInYandexMaps = () => {
  if (!active.value?.stops?.length) return;
  const pts = active.value.stops.map(s => `${s.lat},${s.lng}`);
  const yandex = buildYandexDirectionsUrl(pts);
  window.open(yandex, '_blank');
  showExternalMapsModal.value = false;
};

// init map when drawer opens
watch(active, async (val) => {
  if (!val) return
  await nextTick()
  initMap(val)
})

// init create map when step 2 is reached
watch(currentStep, async (step) => {
  if (step === 2) {
    await nextTick()
    // Clean up existing map if it exists
    if (createMapInstance) {
      createMapInstance.remove()
      createMapInstance = null
    }
    // Clear markers
    createMapMarkers.forEach(marker => marker.remove())
    createMapMarkers = []
    
    // Initialize new map
    initCreateMap()
  } else {
    // Clean up map when leaving step 2
    if (createMapInstance) {
      createMapInstance.remove()
      createMapInstance = null
    }
    createMapMarkers.forEach(marker => marker.remove())
    createMapMarkers = []
  }
})

// Watch for city changes and update map
watch(selectedCity, (newCity) => {
  if (currentStep.value === 2 && createMapInstance) {
    // Get coordinates for new city
    const cityCoords = getCityCoordinates(newCity)
    
    // Fly to new city location
    createMapInstance.flyTo({
      center: cityCoords as [number, number],
      zoom: 12,
      duration: 2000
    })
  }
})

// Check for city changes from header (since localStorage changes aren't reactive)
let lastKnownCity = selectedCity.value
setInterval(() => {
  const currentCity = localStorage.getItem('selectedCity') || 'Калининград'
  if (currentCity !== lastKnownCity) {
    lastKnownCity = currentCity
    selectedCity.value = currentCity
  }
}, 1000) // Check every second

// clean up when drawer closes (optional safety)
watch(() => !!active.value, (open) => {
  if (!open) cleanupMap()
})

// Clean up maps when component unmounts
onUnmounted(() => {
  if (createMapInstance) {
    createMapInstance.remove()
    createMapInstance = null
  }
  createMapMarkers.forEach(marker => marker.remove())
  createMapMarkers = []
})

// --- Rating bar color helper (for meters / bars) ---

// color utilities
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
const hexToRgb = (hex: string) => {
  const m = hex.replace('#', '')
  const int = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}
const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b)
  const r = Math.round(A.r + (B.r - A.r) * t)
  const g = Math.round(A.g + (B.g - A.g) * t)
  const bch = Math.round(A.b + (B.b - A.b) * t)
  return rgbToHex(r, g, bch)
}
const tint = (hex: string, t = 0.35) => mix(hex, '#ffffff', clamp(t))

/**
 * Gradient scale:
 * 4.3 – 5.0 → green (#16a34a)
 * 3.5 – 4.3 → amber (#f59e0b)
 * 0 – 3.5   → red   (#dc2626)
 */
const barStyle = (score: number) => {
  const pct = clamp(score / 5) * 100

  const GREEN = '#16a34a'
  const AMBER = '#f59e0b'
  const RED   = '#dc2626'

  let color = GREEN

  if (score >= 4.3) {
    // green zone (fixed)
    color = GREEN
  } else if (score >= 3.5) {
    const t = (score - 3.5) / (4.3 - 3.5)  // 0 at 3.5, 1 at 4.3
    color = mix(AMBER, GREEN, t)
  } else {
    // red zone
    color = RED
  }

  const soft = tint(color, 0.35)

  return {
    width: `${pct}%`,
    background: `linear-gradient(90deg, ${soft} 0%, ${color} 100%)`,
    boxShadow: `0 0 0 1px ${soft} inset`
  }
}

// --- ROUTING (OSRM demo; switch to your provider in prod) ---




// --- Comment attachments (paperclip) ---
const pendingCommentMedia = ref<string[]>([])     // previews for UI
const handleCommentFiles = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  newCommentFiles.value = files ? Array.from(files) : []
  pendingCommentMedia.value = newCommentFiles.value.map(f => URL.createObjectURL(f))
}

// Create form map functions
const createMapEl = ref<HTMLDivElement | null>(null)
let createMapInstance: Map | null = null
let createMapMarkers: Marker[] = []

const initCreateMap = () => {
  if (!createMapEl.value) return

  // Clean up existing map if it exists
  if (createMapInstance) {
    createMapInstance.remove()
    createMapInstance = null
  }

  // Clear markers
  createMapMarkers.forEach(marker => marker.remove())
  createMapMarkers = []

  // Get coordinates for selected city
  const cityCoords = getCityCoordinates(selectedCity.value)
  
  // Create new map instance
  createMapInstance = new maplibregl.Map({
    container: createMapEl.value,
    style: MAPTILER_STYLE,
    center: cityCoords as [number, number],
    zoom: 12,
    attributionControl: false
  })

  createMapInstance.on('load', () => {
    // Add navigation controls
    createMapInstance!.addControl(new maplibregl.NavigationControl(), 'top-right')
    
    // Add click handler to add stops
    createMapInstance!.on('click', (e: any) => {
      const { lng, lat } = e.lngLat
      addStopAtLocation(lng, lat)
    })

    // Update existing stops on map
    updateCreateMapMarkers()
  })
}

const addStopAtLocation = (lng: number, lat: number) => {
  const newStop = {
    title: `Остановка ${form.value.stops.length + 1}`,
    note: '',
    lat: lat,
    lng: lng
  }
  form.value.stops.push(newStop)
  updateCreateMapMarkers()
}

const updateCreateMapMarkers = async () => {
  // Remove existing markers and route line
  createMapMarkers.forEach(marker => marker.remove())
  createMapMarkers = []
  
  if (createMapInstance) {
    // Remove existing route layers if they exist
    if (createMapInstance.getLayer('create-route-line')) {
      createMapInstance.removeLayer('create-route-line')
    }
    if (createMapInstance.getLayer('create-route-glow')) {
      createMapInstance.removeLayer('create-route-glow')
    }
    if (createMapInstance.getSource('create-route-source')) {
      createMapInstance.removeSource('create-route-source')
    }
  }

  // Hide route info display
  routeInfoData.value.show = false

  // Add markers for each stop
  form.value.stops.forEach((stop, index) => {
    const el = document.createElement('div')
    el.className = 'create-map-pin'
    el.innerHTML = `
      <div class="pin-emoji">📍</div>
      <div class="pin-number">${index + 1}</div>
      <div class="pin-label">${stop.title}</div>
    `
    
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([stop.lng, stop.lat])
      .addTo(createMapInstance!)
    
    createMapMarkers.push(marker)
  })

  // Calculate and display real route between stops
  if (form.value.stops.length > 1 && createMapInstance) {
    await calculateAndDisplayRoute()
  }
}

const calculateAndDisplayRoute = async () => {
  if (!createMapInstance || form.value.stops.length < 2) return

  // Show loading state
  routeInfoData.value = {
    distance: 'Расчет...',
    duration: '',
    show: true
  }

  try {
    // Build coordinates string for OSRM
    const coordinates = form.value.stops.map(stop => `${stop.lng},${stop.lat}`)
    
    // Fetch route from OSRM (walking)
    const response = await fetch(buildOSRMUrl(coordinates))
    
    if (!response.ok) {
      console.error('Failed to fetch route')
      return
    }

    const routeData = await response.json()
    
    if (routeData.routes && routeData.routes.length > 0) {
      const route = routeData.routes[0]
      
      // Update form distance with calculated route distance
      const routeDistanceKm = (route.distance / 1000).toFixed(1)
      form.value.distance = routeDistanceKm
      
      // Calculate route duration with realistic walking speed (4 km/h for tourists)
      const walkingSpeedKmH = 4.0 // 4 km/h for more realistic tourist walking
      const routeDistanceNum = route.distance / 1000
      const routeDurationMinutes = Math.round((routeDistanceNum / walkingSpeedKmH) * 60)
      
      // Convert minutes to hours (decimal format for form)
      const routeDurationHours = (routeDurationMinutes / 60).toFixed(1)
      form.value.duration = routeDurationHours
      
      // Add route to map
      createMapInstance.addSource('create-route-source', {
        type: 'geojson',
        data: route.geometry
      })

      // Add glow effect layer
      createMapInstance.addLayer({
        id: 'create-route-glow',
        type: 'line',
        source: 'create-route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#60a5fa',
          'line-width': 8,
          'line-opacity': 0.3
        }
      })

      // Add main route line
      createMapInstance.addLayer({
        id: 'create-route-line',
        type: 'line',
        source: 'create-route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.9
        }
      })

      // Update route info display
      updateRouteInfo(routeDistanceKm, routeDurationMinutes / 60)
    }
  } catch (error) {
    console.error('Error calculating route:', error)
  }
}

const routeInfoData = ref({
  distance: '',
  duration: '',
  show: false
})

const updateRouteInfo = (distance: string, duration: number) => {
  // Convert decimal hours to hours and minutes format
  const hours = Math.floor(duration)
  const minutes = Math.round((duration - hours) * 60)
  
  let durationText = ''
  if (hours > 0) {
    durationText = `${hours}ч`
    if (minutes > 0) {
      durationText += ` ${minutes}мин`
    }
  } else {
    durationText = `${minutes}мин`
  }
  
  routeInfoData.value = {
    distance,
    duration: durationText,
    show: true
  }
}

const addStopFromMap = () => {
  if (!createMapInstance) {
    initCreateMap()
    return
  }
  const center = createMapInstance.getCenter()
  addStopAtLocation(center.lng, center.lat)
}

const removeStop = (index: number) => {
  form.value.stops.splice(index, 1)
  updateCreateMapMarkers()
  
  if (form.value.stops.length < 2) {
    form.value.distance = ''
  }
}
</script>

<style scoped>
.fhe { padding: 0; }
.fhe-header{ display:flex; justify-content:space-between; align-items:center; margin:0 5vw .5rem; padding-top:0.5rem; }
.fhe-header h2{ font-size:clamp(1.2rem,3.5vw,1.5rem); font-weight:800; margin:0 }
.link{ background:transparent; border:none; color:rgb(26,58,107); font-weight:600; padding:6px 10px; border-radius:10px; cursor:pointer; }
.link:hover{ background:rgba(255,218,185,.3); color:#00b4d8 }

/* Carousel */
.carousel{ display:flex; gap:2vw; padding:8px 5vw 14px; overflow-x:auto; scroll-snap-type:x mandatory; }
.carousel::-webkit-scrollbar{ display:none }
.feat-card{ flex:0 0 70vw; border-radius:18px; overflow:hidden; position:relative; scroll-snap-align:center; box-shadow:0 10px 20px rgba(0,0,0,.12); }
.feat-media{ position:relative; height:36vh }
.feat-img{ width:100%; height:100%; object-fit:cover; display:block }
.feat-overlay{ position:absolute; inset:auto 0 0 0; padding:10px 12px; background:linear-gradient(transparent,rgba(0,0,0,.55)); color:#fff; display:grid; row-gap:6px; }
.feat-title{ margin:0; font-weight:800; font-size:1.05rem }
.feat-meta{ display:flex; gap:10px; align-items:center; font-weight:700; font-size:.92rem }
.diff[data-diff="лёгкий"]{ background:#00ffaadc; color:#075d44; padding:2px 8px; border-radius:8px }
.diff[data-diff="средний"]{ background:#f3dd87; color:#6b5302; padding:2px 8px; border-radius:8px }
.diff[data-diff="сложный"]{ background:#eeb2b2; color:#901d1d; padding:2px 8px; border-radius:8px }
.feat-create{ flex:0 0 42vw; height:25vh; align-self:center; border-radius:16px; border:2px dashed #3b82f6; color:#0b5bd7; background:linear-gradient(135deg,#e0f2ff77,#c7e9ff66); display:grid; place-items:center; gap:6px; font-weight:800; cursor:pointer; scroll-snap-align:center; }
.feat-create span{ font-size:2rem }

/* Filters */
.filters{ padding:4px 5vw 12px; display:grid; row-gap:8px }
.f-input,.f-select{ width:100%; height:42px; padding:0 12px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; font-size:.96rem; }
.f-row{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px }
.chip-row{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:2px }
.chip{ border:1px solid rgba(0,0,0,.08); background:#fff; border-radius:999px; padding:6px 10px; font-weight:700; font-size:.85rem; display:inline-flex; align-items:center; gap:6px; }
.chip.active{ background:#eef6ff; border-color:#a7ccff }
.chip-split{ width:1px; height:20px; background:#e5e7eb; margin:0 4px }

/* Cards */
.grid{ display:grid; grid-template-columns:1fr; gap:10px; padding:0 5vw 22px; }
@media(min-width:768px){ .grid{ grid-template-columns:repeat(3,1fr); } }
.card{ border-radius:16px; overflow:hidden; background:#fff; box-shadow:0 10px 20px rgba(0,0,0,.08); display:grid; grid-template-rows:auto 1fr; }
.media{ position:relative; height:180px }
.thumb{ width:100%; height:100%; object-fit:cover; display:block }
.badge-diff{ position:absolute; left:10px; top:10px; padding:3px 8px; border-radius:10px; background:#00000055; color:#fff; font-weight:800; font-size:.8rem; }
.save{ position:absolute; right:10px; top:10px; width:40px; height:40px; border-radius:10px; border:1px solid rgba(255,255,255,.5); background:rgba(0,0,0,.35); backdrop-filter:blur(4px); color:#fff; display:grid; place-items:center; cursor:pointer; }
.body{ padding:10px 12px 10px; display:grid; row-gap:8px }
.title{ margin:0; font-weight:800; font-size:1.02rem; }
.line-2{ display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2;line-clamp: 2; overflow:hidden; }
.metrics{ display:flex; gap:10px; align-items:center; color:#374151; font-size:.92rem; flex-wrap:wrap }
.rate{ font-weight:800; color:#f59e0b }
.facilities{ display:flex; gap:10px; font-size:1.26rem }
.tags{ display:flex; gap:6px; flex-wrap:wrap }
.tag{ background:#f7f7f9; border:1px solid #ececf2; border-radius:999px; padding:2px 8px; font-weight:700; font-size:.78rem }
.actions{ display:flex; align-items:center; gap:8px; margin-top:2px }
.actions button{ height:36px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; padding:0 10px; display:inline-flex; align-items:center; gap:6px; cursor:pointer }
.like{ color:#ef4444 }
.owner{ margin-left:auto; display:inline-flex; align-items:center; gap:6px }
.owner img{ width:26px; height:26px; border-radius:50%; object-fit:cover }
.owner-name{ font-weight:700; font-size:.9rem }

/* Description styles */
.description {
  margin-top: 6px;
}

.description-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #6b7280;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

/* Description section in detail drawer */
.description-section {
  margin: 10px 14px 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.description-section h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.description-section .description-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #475569;
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}



.empty{ text-align:center; padding:12px 0 24px; color:#6b7280 }

/* Drawer */
.drawer{ position:fixed; inset:0; background:rgba(0,0,0,.3); backdrop-filter:blur(6px); display:grid; place-items:end; z-index:60; }
.sheet{ width:100%; max-height:92vh; background:#fff; border-radius:16px 16px 0 0; overflow:auto; animation:slideUp .25s ease; display:grid; row-gap:12px; padding-bottom:14px; }
.sheet-bar{ display:grid; place-items:center; padding-top:6px }
.drag{ width:46px; height:5px; border-radius:999px; background:#e5e7eb }
.sheet-head{ padding:6px 14px 0 }
.sheet-title{ margin:8px 0 4px; font-weight:900; font-size:1.2rem }

/* centered metric bar */
.sheet-metrics{ width:100%; display:flex; justify-content:center; align-items:center; gap:10px; flex-wrap:wrap; margin-top:6px }
.chip-metric{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; background:#f3f4f6; font-weight:700; }
.chip-metric.rating{ background:#fff7ed; border:1px solid #fed7aa }
.diff-pill[data-diff="лёгкий"]{ background:linear-gradient(90deg,#b6ffd8,#1dbf73); color:#064e3b }
.diff-pill[data-diff="средний"]{ background:linear-gradient(90deg,#ffeaa7,#ff9f1a); color:#7c2d12 }
.diff-pill[data-diff="сложный"]{ background:linear-gradient(90deg,#ffb3b3,#ff2d2d); color:#7f1d1d }

/* media slider */
.media-slider{ padding:10px 10px 0 }
.media-track{ display:grid; grid-auto-flow:column; grid-auto-columns:85%; gap:10px; overflow-x:auto; scroll-snap-type:x mandatory; }
.media-track::-webkit-scrollbar{ display:none }
.media-slide{ scroll-snap-align:center; border-radius:12px; overflow:hidden; background:#000; cursor:pointer }
.media-slide img,.media-slide video{ width:100%; height:240px; object-fit:cover; display:block }

/* Map */
.map{ margin:10px 14px 0; border:1px solid #e5e7eb; border-radius:12px; padding:0; display:flex; flex-direction:column; overflow:hidden }
.map-canvas{ width:100%; height:260px }
.map-hint{ font-size:.85rem; color:#6b7280;  padding: 6px 2px 0; }
.map-box { margin: 10px 14px 0; }
.map-frame {
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  position: relative;
}

.map-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%);
  pointer-events: none;
  z-index: 1;
  border-radius: 16px;
}

/* Map Overlay */
.map-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  pointer-events: none;
}

.map-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* External Maps Section */
.external-maps-section {
  padding: 16px 14px 0;
}

.external-maps-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.external-maps-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.external-icon {
  font-size: 14px;
  opacity: 0.8;
}

/* Enhanced Map Hint */
.map-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin: 8px 14px 0;
  font-size: 13px;
  color: #64748b;
}

/* Apple Maps style pins */
  .apple-pin { 
    position: relative; 
    width: 60px; 
    height: 60px; 
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transform-origin: center bottom;
  }

.pin-emoji {
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center bottom;
}

/* Apple-style drop animation */
.apple-pin.pin-drop { 
  transform: translateY(-60px) scale(0.2); 
  opacity: 0; 
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.apple-pin.pin-drop .pin-emoji {
  transform: scale(0.2);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Steps (carved card) */
.steps{ padding:8px 14px 0 }
.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
}
.steps h4{ margin: 0; font-weight:800; font-size:1.1rem }
.steps-count {
  padding: 4px 10px;
  background: #eef6ff;
  color: #1d4ed8;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.steps-list{ display:grid; row-gap:8px }
.step-item{ 
  display:flex; gap:12px; padding:16px; 
  border-radius:16px; background:#f8fafc; 
  border:1px solid #e2e8f0; cursor:pointer; 
  transition:all .2s ease;
  position: relative;
  overflow: hidden;
}
.step-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.step-item:hover{ 
  background:#eef6ff; border-color:#a7ccff; 
  transform:translateX(4px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}
.step-item:hover::before {
  opacity: 1;
}
.step-number{ 
  width:32px; height:32px; border-radius:50%; 
  background:linear-gradient(135deg, #3b82f6, #1d4ed8); 
  color:#fff; display:grid; place-items:center; 
  font-weight:800; font-size:.9rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  position: relative;
  z-index: 1;
}
.step-content{ flex:1; display:grid; row-gap:6px; position: relative; z-index: 1 }
.step-title{ margin:0; font-weight:700; font-size:.95rem; color: #1f2937 }
.step-note{ margin:0; color:#6b7280; font-size:.85rem; line-height:1.4 }
.step-coordinates {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}
.step-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.step-icon {
  color: #3b82f6;
  font-size: 18px;
}
.step-arrow {
  color: #9ca3af;
  font-size: 16px;
  transition: transform 0.2s ease;
}
.step-item:hover .step-arrow {
  transform: translateX(2px);
  color: #3b82f6;
}

/* Ratings */
.breakdown{ padding:2px 14px 0 }
.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
}
.breakdown h4{ margin: 0; font-weight:800; font-size:1.1rem }
.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.rating-number {
  font-size: 24px;
  font-weight: 900;
  color: #f59e0b;
  line-height: 1;
}
.rating-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
}
.rows{ display:grid; row-gap:12px }
.row{ display:grid; grid-template-columns:140px 1fr auto; align-items:center; gap:12px }
.rating-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}
.bar{ width:100%; height:12px; background:#f1f5f9; border-radius:999px; overflow:hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
.bar-fill{
  height:100%;
  border-radius:999px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  transition: width .45s ease, background .45s ease, box-shadow .45s ease;
}


/* Comments */
.comments{ padding:6px 14px 0; display:grid; row-gap:10px }
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
}
.comments h4{ margin: 0; font-weight:800; font-size:1.1rem }
.comments-count {
  padding: 4px 10px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.c-list{ display:grid; row-gap:10px }
.c-item{ display:grid; grid-template-columns:auto 1fr; gap:10px }
.c-item img{ width:34px; height:34px; border-radius:50%; object-fit:cover }
.c-meta{ display:flex; gap:8px; align-items:center }
.c-date{ color:#6b7280; font-size:.85rem }
.c-text{ margin:2px 0 0 }
.c-media{ display:flex; gap:6px; margin-top:6px }
.c-thumb{ width:70px; height:70px; border-radius:10px; overflow:hidden; cursor:pointer; background:#000 }
.c-thumb img,.c-thumb video{ width:100%; height:100%; object-fit:cover }

.c-form{ display:grid; grid-template-columns:auto 1fr auto; gap:8px; align-items:center }
.attach input{ display:none }
.attach{ width:40px; height:40px; border-radius:10px; border:1px solid #e5e7eb; display:grid; place-items:center; cursor:pointer; background:#fff; }
.btn{ height:40px; border:none; border-radius:10px; background:linear-gradient(135deg,#2563eb,#00bcd4); color:#fff; padding:0 14px; font-weight:800; cursor:pointer; }
.btn.ghost{ background:#eceff3; color:#111827; }
.btn.plane{ display:grid; place-items:center; width:40px; padding:0 }
.btn.plane:active{ animation:takeoff .6s ease forwards }
@keyframes takeoff{ 0%{ transform:translate(0) rotate(0) } 60%{ transform:translate(6px,-8px) rotate(-10deg) } 100%{ transform:translate(14px,-18px) rotate(-18deg); opacity:.2 } }

/* External Maps Modal */
.external-maps-panel { max-width: 400px; margin: 0 auto; }
.maps-options { display: grid; gap: 12px; margin: 20px 0; }
.map-option { 
  display: flex; align-items: center; gap: 12px; padding: 16px; 
  border: 2px solid #e5e7eb; border-radius: 12px; background: #fff; 
  cursor: pointer; transition: all 0.2s ease;
}
.map-option:hover { border-color: #3b82f6; background: #f8fafc; }
.map-icon { font-size: 24px; }
.map-info { text-align: left; }
.map-info strong { display: block; margin-bottom: 4px; }
.map-info span { color: #6b7280; font-size: 14px; }

/* Create Form Map */
.stops-section { margin: 16px 0; }
.stops-map-container { margin: 12px 0; }
.create-map-frame { 
  width: 100%; height: 200px; border-radius: 12px; 
  border: 2px solid #e5e7eb; margin-bottom: 8px;
}
.map-controls { display: flex; gap: 8px; }
.btn.small { padding: 8px 12px; font-size: 14px; }
.stops-list { display: grid; gap: 8px; margin-top: 12px; }
.stop-item { 
  display: flex; align-items: center; gap: 8px; padding: 8px; 
  border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;
}
.stop-number { 
  width: 24px; height: 24px; border-radius: 50%; 
  background: #3b82f6; color: #fff; display: grid; place-items: center; 
  font-weight: 700; font-size: 12px;
}
.stop-info { flex: 1; display: grid; gap: 4px; }
.stop-info input { 
  padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; 
  font-size: 14px;
}
.remove-stop { 
  width: 24px; height: 24px; border-radius: 50%; border: none; 
  background: #ef4444; color: #fff; cursor: pointer; font-weight: 700;
}

.attach-previews{ display:flex; gap:8px; flex-wrap:wrap; margin-top:6px }
.ap-item{ width:70px; height:70px; border-radius:10px; overflow:hidden; background:#000; cursor:pointer }
.ap-item img,.ap-item video{ width:100%; height:100%; object-fit:cover }

.sheet-actions{ display:flex; gap:10px; justify-content:center; padding:6px 14px 8px; }
.save-btn{ display:inline-flex; align-items:center; gap:6px }

/* Viewer */
.viewer{ position:fixed; inset:0; background:rgba(0,0,0,.85); display:grid; place-items:center; z-index:80; }
.viewer-body{ width:min(100vw,900px); max-height:90vh; display:grid; place-items:center; padding:10px }
.viewer-media{ width:100%; max-height:88vh; object-fit:contain; }
.viewer-close{ position:absolute; top:10px; right:10px; width:44px; height:44px; border-radius:12px; border:none; background:#111827; color:#fff; display:grid; place-items:center; cursor:pointer }

/* Modal (create) */
.modal{ 
  position:fixed; 
  inset:0; 
  background:rgba(0,0,0,.3); 
  backdrop-filter:blur(6px); 
  display:flex; 
  align-items:flex-end; 
  justify-content:center; 
  z-index:70; 
  padding: 24px 16px 8px;
  overflow: hidden;
  /* Account for mobile browser UI */
  padding-top: calc(24px + env(safe-area-inset-top, 0px));
}

/* New Create Form Styles */
.create-panel{ 
  width:100%; 
  max-width: 800px;
  max-height:75vh; 
  overflow:hidden; 
  background:#fff; 
  border-radius:16px 16px 0 0; 
  animation:slideUp .25s ease; 
  display:flex; 
  flex-direction:column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  margin-top: 20vh;
  transform: translateY(3vh);
}

.create-panel::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  z-index: 5;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  min-height: 60px;
}

.create-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #f3f4f6;
  color: #6b7280;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.close-btn:active {
  background: #d1d5db;
  transform: scale(0.95);
}

@media (max-width: 480px) {
  .close-btn {
    background: #ef4444;
    color: #fff;
  }
  
  .close-btn:hover {
    background: #dc2626;
  }
}

.create-progress {
  display: flex;
  padding: 20px 24px;
  gap: 8px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
  margin-bottom: 8px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 20px;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 0;
  flex: 1;
}

.progress-step.active {
  background: #3b82f6;
  color: #fff;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.create-step {
  flex: 1;
  padding: 24px;
  padding-top: 32px;
  padding-bottom: 80px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.form-section {
  max-width: 600px;
  margin: 0 auto;
}

.form-section h4 {
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.section-description {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #fff;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error, .form-textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
  font-weight: 500;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .modal {
    padding: 20px 8px 8px;
    padding-top: calc(20px + env(safe-area-inset-top, 0px));
  }
  
  .create-panel {
    max-height: 70vh;
    margin-top: 10vh;
    transform: translateY(2vh);
  }
  
  .create-panel {
    max-height: 80vh;
    border-radius: 12px 12px 0 0;
  }
  
  .create-header {
    padding: 16px 20px 12px;
  }
  
  .create-header h3 {
    font-size: 1.125rem;
  }
  
  .create-progress {
    padding: 12px 20px;
    gap: 8px;
  }
  
  .progress-step {
    padding: 8px 12px;
    font-size: 0.875rem;
  }
  
  .progress-step span {
    display: none;
  }
  
  .create-step {
    padding: 20px;
    padding-top: 28px;
    padding-bottom: 70px;
  }
  
  .form-section {
    max-width: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .difficulty-selector {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .difficulty-btn {
    flex-direction: row;
    justify-content: flex-start;
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .modal {
    padding: 18px 8px 8px;
    padding-top: calc(18px + env(safe-area-inset-top, 0px));
  }
  
  .create-panel {
    max-height: 65vh;
    margin-top: 8vh;
    transform: translateY(1vh);
  }
  
  .create-panel {
    max-height: 78vh;
    border-radius: 12px 12px 0 0;
  }
  
  .create-header {
    padding: 12px 16px 8px;
  }
  
  .create-header h3 {
    font-size: 1rem;
  }
  
  .create-progress {
    padding: 12px 16px;
    gap: 4px;
    margin-bottom: 4px;
  }
  
  .progress-step {
    padding: 6px 8px;
    font-size: 0.75rem;
  }
  
  .step-number {
    width: 20px;
    height: 20px;
    font-size: 0.65rem;
  }
  
  .create-step {
    padding: 16px;
  }
  
  .form-input, .form-textarea {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .create-map-frame {
    height: 150px;
  }
  
  .map-instructions {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
  
  .city-info {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
  
  .route-info-below {
    padding: 16px;
    margin-top: 12px;
  }
  
  .route-info-header h4 {
    font-size: 16px;
  }
  
  .stat-content {
    padding: 12px 16px;
    gap: 12px;
  }
  
  .stat-icon {
    font-size: 20px;
    width: 28px;
  }
  
  .stat-value {
    font-size: 18px;
  }
}

@media (max-width: 400px) {
  .modal {
    padding: 16px 6px 6px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
  }
  
  .create-panel {
    max-height: 60vh;
    margin-top: 6vh;
    transform: translateY(0.5vh);
  }
  
  .create-panel {
    max-height: 75vh;
  }
  
  .create-header {
    padding: 30px 22px 26px;
  }
  
  .create-header h3 {
    font-size: 0.9rem;
  }
  
  .close-btn {
    width: 36px;
    height: 36px;
  }
  
  .create-progress {
    padding: 6px 12px;
  }
  
  .create-step {
    padding: 12px;
    padding-bottom: 60px;
  }
  
  .form-input, .form-textarea {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .create-map-frame {
    height: 120px;
  }
  
  .route-info-below {
    padding: 12px;
    margin-top: 8px;
  }
  
  .stat-content {
    padding: 8px 12px;
    gap: 8px;
  }
  
  .stat-icon {
    font-size: 18px;
    width: 24px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}

@media (max-width: 600px) {
  .modal {
    padding: 19px 6px 6px;
    padding-top: calc(19px + env(safe-area-inset-top, 0px));
  }
  
  .create-panel {
    max-height: 68vh;
    margin-top: 9vh;
    transform: translateY(1.5vh);
  }
  
  .create-panel {
    max-height: 82vh;
  }
  
  .create-header {
    padding: 14px 18px 10px;
  }
  
  .create-progress {
    padding: 16px 18px;
    margin-bottom: 6px;
  }
  
  .progress-step {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  
  .step-number {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
  
  .create-step {
    padding: 18px;
    padding-top: 24px;
    padding-bottom: 65px;
  }
}

.difficulty-selector {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.difficulty-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  color: #6b7280;
}

.difficulty-btn:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.difficulty-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: #fff;
}

.difficulty-btn .iconify {
  font-size: 1.5rem;
}

.tags-input-container {
  position: relative;
}

.tags-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  margin-top: 4px;
}

.suggestions-header {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 8px;
  padding: 0 4px;
}

.tags-suggestions .tag-suggestion {
  display: inline-block;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px;
}

.tags-suggestions .tag-suggestion:hover {
  background: #3b82f6;
  color: #fff;
}

.tags-suggestions .tag-suggestion.add-custom {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.tags-suggestions .tag-suggestion.add-custom:hover {
  background: #0369a1;
  color: #fff;
  border-color: #0369a1;
}

.tag-suggestion {
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-suggestion:hover {
  background: #3b82f6;
  color: #fff;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-chip:hover {
  background: #bae6fd;
}

.tag-chip .iconify {
  font-size: 0.75rem;
}

/* Stops Section */
.stops-map-container {
  margin-bottom: 20px;
}

.map-instructions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  margin-bottom: 12px;
  color: #0369a1;
  font-size: 0.875rem;
  font-weight: 500;
}

.map-instructions > div:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
}

.city-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #0369a1;
  font-weight: 500;
}

.map-instructions .iconify {
  font-size: 1.125rem;
}

.create-map-frame {
  width: 100%;
  height: 200px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #f9fafb;
  cursor: crosshair;
}

.create-map-pin {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
  animation: pinPulse 2s infinite;
}

.create-map-pin:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5));
  animation: none;
}

@keyframes pinPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pin-emoji {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.pin-number {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border: 3px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  box-shadow: 0 3px 8px rgba(255, 107, 107, 0.4);
  animation: numberGlow 2s ease-in-out infinite alternate;
}

@keyframes numberGlow {
  0% {
    box-shadow: 0 3px 8px rgba(255, 107, 107, 0.4);
  }
  100% {
    box-shadow: 0 3px 12px rgba(255, 107, 107, 0.7);
  }
}

.pin-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.create-map-pin:hover .pin-label {
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.route-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  min-width: 300px;
  max-width: 340px;
  backdrop-filter: blur(10px);
}

.route-info-below {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-top: 16px;
}

.route-info-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.route-info-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.route-info-below .route-info-header h4 {
  color: #111827;
  text-shadow: none;
}

.route-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.route-stat {
  padding: 0;
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.stat-content:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.route-info-below .stat-content {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  backdrop-filter: none;
}

.route-info-below .stat-content:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
  width: 32px;
  text-align: center;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-value {
  font-weight: 800;
  font-size: 20px;
  color: #ffffff;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.route-info-below .stat-value {
  color: #111827;
  text-shadow: none;
}

.route-info-below .stat-label {
  color: #6b7280;
  text-shadow: none;
}

.map-controls {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.map-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  background: #3b82f6;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.map-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.map-btn.secondary {
  background: #fff;
  color: #3b82f6;
}

.map-btn.secondary:hover {
  background: #f0f9ff;
}

.map-btn-small {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.map-btn-small:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.empty-stops {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-stops .iconify {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-stops p {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 1.125rem;
}

.empty-stops span {
  font-size: 0.875rem;
  line-height: 1.5;
}

.stops-list {
  display: grid;
  gap: 12px;
}

.stop-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.stop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.stop-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.remove-stop {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-stop:hover {
  background: #fecaca;
}

.stop-content {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.stop-title-input, .stop-note-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.stop-note-input {
  resize: vertical;
  min-height: 60px;
}

.stop-coordinates {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}

/* Facilities Section */
.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.facility-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-weight: 500;
  color: #6b7280;
}

.facility-item:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.facility-item.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: #fff;
}

.facility-item .iconify {
  font-size: 1.5rem;
}

.payment-section {
  margin-bottom: 32px;
}

.payment-section h5 {
  margin: 0 0 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.payment-option {
  display: block;
  cursor: pointer;
}

.payment-option input {
  display: none;
}

.payment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  transition: all 0.2s ease;
  text-align: center;
  font-weight: 500;
  color: #6b7280;
}

.payment-option input:checked + .payment-content {
  border-color: #3b82f6;
  background: #3b82f6;
  color: #fff;
}

.costs-section {
  margin-top: 24px;
}

.costs-section h5 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.costs-input {
  margin-top: 12px;
}

.costs-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.cost-type-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cost-type-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s ease;
  cursor: pointer;
}

.cost-type-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.cost-input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cost-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.cost-label .iconify {
  font-size: 18px;
  color: #6b7280;
}

.cost-amount-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s ease;
}

.cost-amount-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.cost-amount-field::placeholder {
  color: #9ca3af;
}

.costs-notes {
  margin-top: 16px;
}

.costs-notes-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
}

.costs-notes-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.costs-notes-field::placeholder {
  color: #9ca3af;
}

.payment-content .iconify {
  font-size: 1.5rem;
}

/* Ratings Section */
.ratings-section {
  margin-bottom: 32px;
}

.ratings-section h5 {
  margin: 0 0 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.ratings-grid {
  display: grid;
  gap: 20px;
}

.rating-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

@media (max-width: 768px) {
  .ratings-section {
    margin-bottom: 24px;
  }
  
  .ratings-grid {
    gap: 16px;
  }
  
  .rating-item {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }
  
  .rating-item label {
    font-size: 0.9rem;
  }
  
  .rating-stars {
    justify-content: center;
    gap: 2px;
  }
  
  .star-btn {
    width: 28px;
    height: 28px;
  }
  
  .rating-value {
    text-align: center;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .ratings-section {
    margin-bottom: 20px;
  }
  
  .ratings-section h5 {
    font-size: 0.9rem;
    margin-bottom: 12px;
  }
  
  .ratings-grid {
    gap: 12px;
  }
  
  .rating-item {
    padding: 10px;
    gap: 8px;
  }
  
  .rating-item label {
    font-size: 0.8rem;
  }
  
  .star-btn {
    width: 24px;
    height: 24px;
  }
  
  .rating-value {
    font-size: 0.8rem;
  }
}

@media (max-width: 400px) {
  .ratings-section {
    margin-bottom: 16px;
  }
  
  .ratings-section h5 {
    font-size: 0.85rem;
    margin-bottom: 10px;
  }
  
  .ratings-grid {
    gap: 10px;
  }
  
  .rating-item {
    padding: 8px;
    gap: 6px;
  }
  
  .rating-item label {
    font-size: 0.75rem;
  }
  
  .star-btn {
    width: 22px;
    height: 22px;
  }
  
  .rating-value {
    font-size: 0.75rem;
  }
}

.rating-item label {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #e5e7eb;
  color: #9ca3af;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-btn:hover {
  background: #fbbf24;
  color: #fff;
}

.star-btn.active {
  background: #fbbf24;
  color: #fff;
}

.rating-value {
  font-weight: 700;
  color: #f59e0b;
  min-width: 40px;
  text-align: center;
}

/* Media Section */
.media-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.media-upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-content .iconify {
  font-size: 3rem;
  color: #9ca3af;
}

.upload-content h5 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.upload-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.upload-content span {
  color: #9ca3af;
  font-size: 0.75rem;
}

.media-preview {
  margin-top: 24px;
}

.media-preview h5 {
  margin: 0 0 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.media-item img, .media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-media {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 0.75rem;
}

.cover-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  padding: 2px 6px;
  background: #3b82f6;
  color: #fff;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
}

/* Navigation */
.create-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem 0.5rem;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  position: sticky;
  bottom: 0;
  gap: 0.5rem;
  margin-top: auto;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn.primary {
  background: #3b82f6;
  color: #fff;
}

.nav-btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.nav-btn.primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.nav-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.nav-btn.secondary:hover {
  background: #e5e7eb;
}

/* Legacy styles for backward compatibility */
.panel{ width:100%; max-height:92vh; overflow:auto; background:#fff; border-radius:16px 16px 0 0; padding:14px; animation:slideUp .25s ease; display:grid; row-gap:10px; }
.panel h3{ margin:0 0 4px }
.row2{ display:grid; grid-template-columns:1fr 1fr; gap:8px }
.panel input,.panel textarea,.panel select{ width:100%; height:42px; border:1px solid #e5e7eb; border-radius:10px; padding:0 10px; font-size:.95rem; }
.panel textarea{ height:88px; padding:8px 10px; resize:vertical; }
.check{ display:flex; align-items:center; gap:8px }
.tags-edit{ display:flex; flex-wrap:wrap; gap:6px }
.tags-edit .tag{ cursor:pointer }
.uploader{ display:inline-flex; align-items:center; gap:8px; border:1px dashed #d1d5db; padding:10px; border-radius:10px; cursor:pointer }
.uploader input{ display:none }

/* Animations */
@keyframes slideUp{ from{ transform:translateY(100%) } to{ transform:translateY(0) } }


@keyframes drop {
  0%   { transform: translateY(-20px) scale(.8) rotate(-45deg); opacity: 0; }
  60%  { transform: translateY(6px) scale(1.05) rotate(-45deg); opacity: 1; }
  100% { transform: translateY(0) rotate(-45deg); }
}

.pin-body {
  width: 18px; height: 18px;
  background: #e11d48;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 0 0 2px #fff inset, 0 2px 8px rgba(0,0,0,.25);
  animation: drop .5s ease forwards;
}

/* Apple-style bounce animation */
@keyframes appleBounce {
  0%, 100% { transform: translateY(0) scale(1) }
  25%      { transform: translateY(-12px) scale(1.15) }
  50%      { transform: translateY(-4px) scale(1.08) }
  75%      { transform: translateY(-8px) scale(1.12) }
}
.apple-pin.pin-bounce .pin-emoji { 
  animation: appleBounce 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));
}

/* Apple-style pulse for hover */
@keyframes applePulse {
  0%, 100% { transform: scale(1) }
  50%      { transform: scale(1.2) }
}
.apple-pin.pin-pulse .pin-emoji { 
  animation: applePulse 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6));
}

/* Apple-style vibration for active selection */
@keyframes appleVibrate {
  0%, 100% { transform: translateX(0) rotate(0deg) scale(1); }
  10% { transform: translateX(-6px) rotate(-3deg) scale(1.2); }
  20% { transform: translateX(6px) rotate(3deg) scale(1.15); }
  30% { transform: translateX(-6px) rotate(-3deg) scale(1.25); }
  40% { transform: translateX(6px) rotate(3deg) scale(1.1); }
  50% { transform: translateX(-3px) rotate(-1.5deg) scale(1.2); }
  60% { transform: translateX(3px) rotate(1.5deg) scale(1.15); }
  70% { transform: translateX(-3px) rotate(-1.5deg) scale(1.2); }
  80% { transform: translateX(3px) rotate(1.5deg) scale(1.1); }
  90% { transform: translateX(-1px) rotate(-0.5deg) scale(1.05); }
}

.apple-pin.pin-vibrate .pin-emoji { 
  animation: appleVibrate 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.7));
}
@keyframes applePulsate {
  0%, 100% { transform: scale(1); opacity: 1; }
  25% { transform: scale(1.3); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 0.9; }
  75% { transform: scale(1.4); opacity: 0.7; }
}

.apple-pin.pin-pulsate .pin-emoji { 
  animation: applePulsate 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  filter: drop-shadow(0 10px 25px rgba(0,0,0,0.8));
}

/* Star Rating Styling */
.rating-section button .iconify {
  color: #fbbf24;
  opacity: 0.3;
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.rating-section button.active .iconify {
  opacity: 1;
  color: #f59e0b;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.rating-section button:hover .iconify {
  transform: scale(1.1);
}
</style>