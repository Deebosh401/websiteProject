// src/filterConfig.ts
export interface FilterConfig {
  [key: string]: any
}

export const filterOptions: FilterConfig = {
  'Экскурсии': {
    priceRange: { label: 'Цена', type: 'range', min: 0, max: 10000, step: 100 },
    excursionType: { label: 'Тип экскурсии', type: 'single', options: ['турфирма', 'мини группа'] },
    transportType: { label: 'Тип передвижения', type: 'single', options: ['автобус', 'индивидуально', 'пешком', 'прочее'] },
    duration: { label: 'Длительность', type: 'single', options: ['1-3ч', '3-5ч', '5-8ч', 'весь день'] },
    accessible: { label: 'Доступность', type: 'single', options: ['да', 'нет'] },
    familyFriendly: { label: 'Семейные', type: 'single', options: ['да', 'нет'] },
    season: { label: 'Сезон', type: 'single', options: ['лето', 'зима', 'только хорошая погода'] },
    difficulty: { label: 'Сложность', type: 'single', options: ['легкий', 'средний', 'сложный'] },
  },
  'Где поесть': {
    cuisine: {
      label: 'Тип кухни',
      type: 'multi',
      options: [
        'балтийская',
        'европейская',
        'американская',
        'вегетарианская/веганская',
        'фастфуд',
        'морепродукты',
        'стейк-хаус',
        'азиатская',
      ],
    },
    priceLevel: {
      label: 'Средний чек',
      type: 'single',
      options: ['300-800', '800-1500', '2500+'],
    },
    openHours: {
      label: 'Время работы',
      type: 'time',
    },
    placeType: {
      label: 'Тип заведения',
      type: 'single',
      options: [
        'ресторан',
        'кафе',
        'бар/паб',
        'кофейня',
        'кондитерская',
        'фастфуд',
        'пиццерия',
        'стейк-хаус',
        'уличная еда',
        'булочная',
      ],
    },
    canReserve: {
      label: 'Бронирование',
      type: 'single',
      options: ['да', 'нет'],
    },
  },

  'Размещение': {
    stars: { label: 'Звезды', type: 'single', options: ['5★', '4★', '3★', '2★', '1★'] },
    priceRange: { label: 'Цена за ночь', type: 'range', min: 0, max: 20000, step: 500 },
    amenities: { label: 'Удобства', type: 'multi', options: ['Wi‑Fi', 'Парковка', 'Завтрак', 'Бассейн', 'SPA', 'Прачечная', 'Кухня'] },
    familyFriendly: { label: 'Семейные', type: 'single', options: ['да', 'нет'] },
    dogFriendly: { label: 'С животными', type: 'single', options: ['да', 'нет'] },
  },

  'Исторические места': {
    period: { label: 'Период', type: 'single', options: ['XIX', 'XX', 'Средневековье', 'Советское'] },
    ticketPrice: { label: 'Билет', type: 'range', min: 0, max: 2000, step: 50 },
    freeDay: { label: 'Бесплатные дни', type: 'single', options: ['да', 'нет'] },
    accessible: { label: 'Доступность', type: 'single', options: ['да', 'нет'] },
  },

  'Активный отдых': {
    difficulty: { label: 'Сложность', type: 'single', options: ['легкий', 'средний', 'сложный'] },
    duration: { label: 'Длительность', type: 'single', options: ['1-3ч', '3-5ч', '5-8ч', 'весь день'] },
    gearIncluded: { label: 'Снаряжение включено', type: 'single', options: ['да', 'нет'] },
    indoorOutdoor: { label: 'Формат', type: 'single', options: ['indoor', 'outdoor'] },
    minAge: { label: 'Мин. возраст', type: 'range', min: 0, max: 21, step: 1 },
  },

  'Музеи': {
    ticketPrice: { label: 'Билет', type: 'range', min: 0, max: 1500, step: 50 },
    freeDay: { label: 'Бесплатные дни', type: 'single', options: ['да', 'нет'] },
    openHours: { label: 'Время работы', type: 'time' },
    accessible: { label: 'Доступность', type: 'single', options: ['да', 'нет'] },
  },

  'Концерты': {
    genre: { label: 'Жанр', type: 'single', options: ['рок', 'поп', 'джаз', 'классика', 'электронная'] },
    startTime: { label: 'Время начала', type: 'time' },
    ticketPrice: { label: 'Билет', type: 'range', min: 0, max: 5000, step: 100 },
  },

  'Театры': {
    genre: { label: 'Жанр', type: 'single', options: ['драма', 'комедия', 'балет', 'опера', 'детский'] },
    startTime: { label: 'Время начала', type: 'time' },
    ticketPrice: { label: 'Билет', type: 'range', min: 0, max: 7000, step: 100 },
    accessible: { label: 'Доступность', type: 'single', options: ['да', 'нет'] },
  },

  'Кино': {
    genre: { label: 'Жанр', type: 'single', options: ['боевик', 'комедия', 'драма', 'семейный', 'ужасы'] },
    startTime: { label: 'Сеанс', type: 'time' },
    ticketPrice: { label: 'Билет', type: 'range', min: 0, max: 1500, step: 50 },
  },

  'Мастер-классы': {
    difficulty: { label: 'Сложность', type: 'single', options: ['легкий', 'средний', 'сложный'] },
    duration: { label: 'Длительность', type: 'single', options: ['1-3ч', '3-5ч', '5-8ч'] },
    gearIncluded: { label: 'Материалы включены', type: 'single', options: ['да', 'нет'] },
    minAge: { label: 'Мин. возраст', type: 'range', min: 0, max: 21, step: 1 },
  },

  'Парки/cкверы': {
    amenities: { label: 'Инфраструктура', type: 'multi', options: ['детская площадка', 'аллеи', 'озеро', 'скейт-парк', 'кафе', 'туалет'] },
    indoorOutdoor: { label: 'Формат', type: 'single', options: ['outdoor'] },
    dogFriendly: { label: 'С собаками', type: 'single', options: ['да', 'нет'] },
  },

  'Семейный выход': {
    kidFriendly: { label: 'Дети', type: 'single', options: ['да', 'нет'] },
    priceRange: { label: 'Бюджет', type: 'range', min: 0, max: 10000, step: 100 },
    indoorOutdoor: { label: 'Формат', type: 'single', options: ['indoor', 'outdoor'] },
  },

  'Отпускной транспорт': {
    transportType: { label: 'Тип', type: 'single', options: ['автобус', 'индивидуально', 'прочее'] },
    priceRange: { label: 'Стоимость', type: 'range', min: 0, max: 20000, step: 200 },
  },

  'Выставки': {
    genre: { label: 'Тематика', type: 'single', options: ['искусство', 'фото', 'наука', 'история', 'техника'] },
    ticketPrice: { label: 'Билет', type: 'range', min: 0, max: 3000, step: 50 },
    freeDay: { label: 'Бесплатные дни', type: 'single', options: ['да', 'нет'] },
  },

  'Где поесть': {
    cuisine: {
      label: 'Тип кухни',
      type: 'multi',
      options: [
        'балтийская','европейская','американская','вегетарианская/веганская','фастфуд','морепродукты','стейк-хаус','азиатская'
      ],
    },
    priceRange: { label: 'Средний чек', type: 'range', min: 0, max: 6000, step: 100 },
    placeType: { label: 'Тип', type: 'single', options: ['ресторан','кафе','бар/паб','кофейня','фастфуд','пиццерия','стейк-хаус'] },
    openHours: { label: 'Время работы', type: 'time' },
    canReserve: { label: 'Бронирование', type: 'single', options: ['да','нет'] },
  },
}
