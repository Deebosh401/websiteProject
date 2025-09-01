import { ref } from "vue"

// Utility functions for emoji representation
export const getAccessibilityEmoji = (accessible: boolean | undefined) => {
  return accessible ? '♿️' : ''
}

export const getWorkingHoursEmoji = (hours: string | undefined) => {
  if (!hours) return ''
  return '🕣'
}

export const getFamilyEmoji = (family: boolean | undefined) => {
  return family ? '👨‍👩‍👧‍👦' : ''
}

export const getPriceEmoji = (price: number | undefined) => {
  if (!price) return ''
  if (price === 0) return '🆓'
  if (price <= 500) return '💰'
  if (price <= 1500) return '💰💰'
  return '💰💰💰'
}

export const getRatingEmoji = (rating: number | undefined) => {
  if (!rating) return ''
  if (rating >= 4.5) return '⭐️⭐️⭐️⭐️⭐️'
  if (rating >= 4.0) return '⭐️⭐️⭐️⭐️'
  if (rating >= 3.5) return '⭐️⭐️⭐️'
  return '⭐️⭐️'
}

export const getCategoryEmoji = (category: string) => {
  const emojiMap: Record<string, string> = {
    'Активный отдых': '🏃‍♂️',
    'Семейный выход': '👨‍👩‍👧‍👦',
    'Экскурсии': '🗺️',
    'Где поесть': '🍽️',
    'Отели': '🏨',
    'Развлечения': '🎭',
    'Музеи': '🏛️',
    'Парки': '🌳',
    'Исторические места': '🏰',
    'Концерты': '🎵',
    'Театры': '🎭',
    'Кино': '🎬',
    'Мастер-классы': '🎨',
    'Спорт': '⚽',
    'Ночная жизнь': '🌙',
    'Шоппинг': '🛍️',
    'Транспорт': '🚗'
  }
  return emojiMap[category] || '📍'
}

export type ExcursionType = 'турфирма' | 'мини группа'
export type TransportType = 'автобус' | 'индивидуально' | 'пешком' | 'прочее'
export type DurationRange = '1-3ч' | '3-5ч' | '5-8ч' | 'весь день'
export type Season = 'лето' | 'зима' | 'только хорошая погода'
export type PriceLevel = 'бюджетные' | 'средние' | 'дорогие' | 'премиум'
export type PlaceType = 'ресторан' | 'кафе' | 'бар/паб' | 'кофейня' | 'кондитерская' | 'фастфуд' | 'пиццерия' | 'стейк-хаус' | 'уличная еда' | 'булочная'

export interface Review {
  user: string
  rating: number
  comment: string
  date: string
  level: 'beginner' | 'moderate' | 'legend'
}

export interface Attraction {
  id: number
  name: string
  categories: string[] // Changed from single category to array of categories
  image?: string
  date?: string
  checkedIn?: number
  price?: number
  location?: string
  meetingPoint?: string
  endPoint?: string
  whatsapp?: string
  instagram?: string
  description?: string
  reviews?: Review[]
  rating?: number
  city?: string

  // Filter properties - now using proper Russian names
  'Тип экскурсии'?: ExcursionType
  'Тип транспорта'?: TransportType
  'Длительность'?: DurationRange
  'Доступность'?: boolean
  'Семейные'?: boolean
  'Сезон'?: Season
  'Кухня'?: string[]
  'Средний чек'?: PriceLevel
  'Время работы'?: string
  'Парковка'?: boolean
  'Тип заведения'?: PlaceType
  'Бронирование'?: boolean
  'Оплата'?: string // 'наличные', 'карта', 'наличные/карта'
  'Группа'?: string // 'индивидуально', 'малая группа', 'большая группа'
  'Инструктор'?: boolean
  'Сертификат'?: boolean
  'Фото/видео'?: boolean
  'Сменная одежда'?: boolean
  'Душ'?: boolean
  'Wi-Fi'?: boolean

  // Hotel properties
  'Звезды'?: number // hotels
  'Удобства'?: string[] // wifi, parking, breakfast, pool, spa
  'С животными'?: boolean

  // Entertainment properties
  'Жанр'?: string // concerts/theaters/cinema
  'Период'?: string // historical period
  'Время начала'?: string
  'Время сеанса'?: string

  // General properties
  'Цена билета'?: number
  'Бесплатные дни'?: boolean
  'Сложность'?: 'легкий' | 'средний' | 'сложный'
  'Мин возраст'?: number
  'Снаряжение включено'?: boolean
  'Материалы включены'?: boolean
  'Инфраструктура'?: string[]
  'Формат'?: 'в помещении' | 'на улице'
  'Для детей'?: boolean
  'Бюджет'?: number
  'Стоимость'?: number
  'Тематика'?: string

  // Legacy properties for backward compatibility
  indoor?: boolean
  outdoor?: boolean
  familyFriendly?: boolean
  startTime?: string
}

export const allAttractions = ref<Attraction[]>([
  {
    id: 1,
    name: 'Аэротруба',
    categories: ['Активный отдых', 'Семейный выход'],
    image: '/Aerotruba.jpg',
    date: '2025-08-22T10:45:00',
    checkedIn: 80,
    price: 0,
    location: 'Спортцентр Калининград',
    meetingPoint: 'Главный вход',
    endPoint: 'Там же',
    whatsapp: 'https://chat.whatsapp.com/example1',
    instagram: 'https://instagram.com/example1',
    description: 'Посещение аэротрубы',
    rating:4.6,
    city:"Калининград",
  },
  {
    id: 101,
    name: 'Пляж Янтарного',
    categories: ['Активный отдых', 'Семейный выход'],
    image: '/Yantarnyi.jpeg',
    date: '2025-08-22T10:45:00',
    checkedIn: 45,
    price: 0,
    location: 'Пляж Янтарного',
    meetingPoint: 'Центральный вход на пляж',
    endPoint: 'Там же',
    description: 'Красивый песчаный пляж с янтарем',
    rating: 4.8,
    city: "Янтарный",
  },
  {
    id: 102,
    name: 'Курортный проспект',
    categories: ['Исторические места', 'Семейный выход'],
    image: '/Svetlogorsk.jpeg',
    date: '2025-08-22T10:45:00',
    checkedIn: 67,
    price: 0,
    location: 'Курортный проспект',
    meetingPoint: 'Начало проспекта',
    endPoint: 'Конец проспекта',
    description: 'Исторический променад с красивой архитектурой',
    rating: 4.7,
    city: "Светлогорск",
  },
  {
    id: 3,
    name: 'Экскурсия по замкам Калининградской области',
    categories: ['Экскурсии', 'Исторические места', 'Семейный выход'],
    image: '/zamki.png',
    date: '2025-09-15T12:00:00',
    price: 1000,
    checkedIn: 25,
    location: 'Южный вокзал, Калининград',
    meetingPoint: 'Южный вокзал',
    endPoint: 'пос. Низовье',
    whatsapp: 'https://chat.whatsapp.com/example2',
    instagram: 'https://instagram.com/example2',
    description: 'Поездка по кирхам и замкам области',
    rating:4.6,
    'Тип экскурсии': 'турфирма',
    'Тип транспорта': 'автобус',
    'Длительность': '3-5ч',
    'Доступность': true,
    'Семейные': true,
    'Сезон': 'лето',
    city:"Калининград",
  },
  {
    id: 2,
    name: 'Итальянский ресторан La Dolce Vita',
    categories: ['Где поесть'],
    image: '/DolceVita.jpg',
    price: 2500,
    description: 'Итальянский ресторан в центре города',
    rating:4.6,
    'Кухня': ['Итальянская'],
    'Средний чек': 'дорогие',
    'Тип заведения': 'ресторан',
    'Бронирование': true,
    'Время работы': '12:00-23:00',
    'Парковка': true,
    'Wi-Fi': true,
    city:"Калининград",
    checkedIn:32,
  },
  {
    id: 3,
    name: 'Кофейня "У Моря"',
    categories: ['Где поесть'],
    image: '/Category.resto.jpeg',
    price: 800,
    description: 'Уютная кофейня с видом на море',
    rating: 4.8,
    'Кухня': ['Европейская'],
    'Средний чек': 'средние',
    'Тип заведения': 'кофейня',
    'Бронирование': false,
    'Время работы': '08:00-22:00',
    'Парковка': false,
    'Wi-Fi': true,
    city: "Светлогорск",
    checkedIn: 45,
  },
  {
    id: 6,
    name: 'Стейк-хаус "Балтика"',
    categories: ['Где поесть'],
    image: '/Category.resto.jpeg',
    price: 3500,
    description: 'Премиальный стейк-хаус с мясом из местных ферм',
    rating: 4.9,
    'Кухня': ['Американская'],
    'Средний чек': 'премиум',
    'Тип заведения': 'стейк-хаус',
    'Бронирование': true,
    'Время работы': '18:00-01:00',
    'Парковка': true,
    'Wi-Fi': false,
    city: "Калининград",
    checkedIn: 28,
  },
  {
    id: 7,
    name: 'Веганское кафе "Зелень"',
    categories: ['Где поесть'],
    image: '/Category.resto.jpeg',
    price: 1200,
    description: 'Современное веганское кафе с органическими продуктами',
    rating: 4.7,
    'Кухня': ['Веганская'],
    'Средний чек': 'средние',
    'Тип заведения': 'кафе',
    'Бронирование': true,
    'Время работы': '10:00-21:00',
    'Парковка': false,
    'Wi-Fi': true,
    city: "Калининград",
    checkedIn: 67,
  },
  {
    id: 8,
    name: 'Кондитерская "Сладкая жизнь"',
    categories: ['Где поесть'],
    image: '/Category.resto.jpeg',
    price: 500,
    description: 'Домашняя кондитерская с авторскими десертами',
    rating: 4.5,
    'Кухня': ['Европейская'],
    'Средний чек': 'бюджетные',
    'Тип заведения': 'кондитерская',
    'Бронирование': false,
    city: "Зеленоградск",
    checkedIn: 89,
  },
  {
    id: 103,
    name: 'Музей янтаря',
    categories: ['Музеи', 'Исторические места'],
    image: '/Museums.jpeg',
    price: 300,
    description: 'Музей янтаря с уникальной коллекцией',
    rating: 4.6,
    'Время работы': '10:00-18:00',
    'Бесплатные дни': true,
    city: "Янтарный",
    checkedIn: 34,
  },
  {
    id: 104,
    name: 'Парк Победы',
    categories: ['Парки', 'Семейный выход'],
    image: '/Parks.jpeg',
    price: 0,
    description: 'Красивый парк с фонтанами и аллеями',
    rating: 4.5,
    'Время работы': '06:00-23:00',
    'Парковка': true,
    city: "Калининград",
    checkedIn: 156,
  },
  {
    id: 105,
    name: 'Набережная Зеленоградска',
    categories: ['Исторические места', 'Семейный выход'],
    image: '/Zelenogradsk.jpeg',
    price: 0,
    description: 'Живописная набережная с променадом',
    rating: 4.7,
    'Время работы': 'Круглосуточно',
    city: "Зеленоградск",
    checkedIn: 78,
  },
  {
    id: 9,
    name: 'Азиатский ресторан "Сакура"',
    categories: ['Где поесть'],
    image: '/Category.resto.jpeg',
    price: 1800,
    description: 'Аутентичная азиатская кухня',
    rating: 4.6,
    'Кухня': ['Японская'],
    'Средний чек': 'дорогие',
    'Тип заведения': 'ресторан',
    'Бронирование': true,
    city: "Калининград",
    checkedIn: 34,
  },
  {
    id: 10,
    name: 'Булочная "Хлеб и Соль"',
    categories: ['Где поесть'],
    image: '/Category.resto.jpeg',
    price: 300,
    description: 'Традиционная булочная с домашним хлебом',
    rating: 4.4,
    'Кухня': ['европейская'],
    'Средний чек': 'бюджетные',
    'Тип заведения': 'булочная',
    'Бронирование': false,
    city: "Советск",
    checkedIn: 156,
  },
  {
    id: 11,
    name: 'Музей Мирового океана',
    categories: ['Музеи', 'Исторические места', 'Семейный выход'],
    image: '/Museums.jpeg',
    price: 800,
    description: 'Интерактивный музей с аквариумами и историческими экспонатами',
    rating: 4.8,
    'Цена билета': 800,
    'Бесплатные дни': true,
    'Доступность': true,
    'Семейные': true,
    city: "Калининград",
    checkedIn: 234,
  },
  {
    id: 12,
    name: 'Парк культуры и отдыха "Юность"',
    categories: ['Парки/cкверы', 'Семейный выход', 'Активный отдых'],
    image: '/Parks.jpeg',
    price: 0,
    description: 'Большой парк с аттракционами, детскими площадками и спортивными зонами',
    rating: 4.5,
    'Инфраструктура': ['детская площадка', 'аллеи', 'озеро', 'кафе'],
    'Формат': 'на улице',
    'Семейные': true,
    city: "Калининград",
    checkedIn: 567,
  },
  {
    id: 13,
    name: 'Мастер-класс по гончарному делу',
    categories: ['Мастер-классы', 'Семейный выход'],
    image: '/Workshop.jpeg',
    price: 1500,
    description: 'Обучение гончарному искусству для всей семьи',
    rating: 4.7,
    'Сложность': 'средний',
    'Длительность': '3-5ч',
    'Снаряжение включено': true,
    'Мин возраст': 8,
    'Семейные': true,
    'Оплата': 'наличные/карта',
    'Группа': 'малая группа',
    'Инструктор': true,
    'Сертификат': true,
    'Фото/видео': true,
    'Сменная одежда': true,
    'Душ': false,
    'Wi-Fi': true,
    'Парковка': true,
    'Доступность': true,
    city: "Зеленоградск",
    checkedIn: 45,
  },
  {
    id: 15,
    name: 'Мастер-класс по живописи',
    categories: ['Мастер-классы'],
    image: '/Workshop.jpeg',
    price: 2000,
    description: 'Обучение живописи маслом для начинающих',
    rating: 4.8,
    'Сложность': 'легкий',
    'Длительность': '1-3ч',
    'Снаряжение включено': true,
    'Мин возраст': 12,
    'Семейные': false,
    'Оплата': 'карта',
    'Группа': 'индивидуально',
    'Инструктор': true,
    'Сертификат': false,
    'Фото/видео': true,
    'Сменная одежда': false,
    'Душ': false,
    'Wi-Fi': true,
    'Парковка': false,
    'Доступность': true,
    city: "Калининград",
    checkedIn: 23,
  },
  {
    id: 16,
    name: 'Мастер-класс по кузнечному делу',
    categories: ['Мастер-классы'],
    image: '/Workshop.jpeg',
    price: 3500,
    description: 'Создание металлических изделий в кузнице',
    rating: 4.9,
    'Сложность': 'сложный',
    'Длительность': '5-8ч',
    'Снаряжение включено': true,
    'Мин возраст': 16,
    'Семейные': false,
    'Оплата': 'наличные',
    'Группа': 'малая группа',
    'Инструктор': true,
    'Сертификат': true,
    'Фото/видео': false,
    'Сменная одежда': true,
    'Душ': true,
    'Wi-Fi': false,
    'Парковка': true,
    'Доступность': false,
    city: "Светлогорск",
    checkedIn: 12,
  },
  {
    id: 14,
    name: 'Концерт в Кафедральном соборе',
    categories: ['Концерты', 'Исторические места'],
    image: '/Category.concerts.jpeg',
    price: 1200,
    description: 'Органный концерт в историческом соборе',
    rating: 4.9,
    'Жанр': 'классика',
    'Время начала': '19:00',
    'Цена билета': 1200,
    'Доступность': true,
    city: "Калининград",
    checkedIn: 89,
  },
  {
    id: 4,
    name: 'Аэротруба',
    categories: ['Активный отдых', 'Семейный выход'],
    image: '/Aerotruba.jpg',
    date: '2025-08-20T10:45:00',
    checkedIn: 80,
    price: 0,
    location: 'Спортцентр Калининград',
    meetingPoint: 'Главный вход',
    endPoint: 'Там же',
    whatsapp: 'https://chat.whatsapp.com/example1',
    instagram: 'https://instagram.com/example1',
    description: 'Посещение аэротрубы',
    rating:4,
    city:"Калининград",
  },
  {
    id: 5,
    name: 'Аэротруба',
    categories: ['Активный отдых', 'Семейный выход'],
    image: '/Aerotruba.jpg',
    date: '2025-08-23T10:45:00',
    checkedIn: 80,
    price: 0,
    location: 'Спортцентр Калининград',
    meetingPoint: 'Главный вход',
    endPoint: 'Там же',
    whatsapp: 'https://chat.whatsapp.com/example1',
    instagram: 'https://instagram.com/example1',
    description: 'Посещение аэротрубы',
    rating:4.6,
    city:"Калининград",
  },
  {
    id: 106,
    name: 'Летний фестиваль в Светлогорске',
    categories: ['Концерты', 'Развлечения'],
    image: '/Category.concerts.jpeg',
    price: 800,
    description: 'Ежегодный летний музыкальный фестиваль',
    rating: 4.8,
    'Жанр': 'поп',
    'Время начала': '18:00',
    'Цена билета': 800,
    'Доступность': true,
    city: "Светлогорск",
    checkedIn: 234,
  },
  {
    id: 107,
    name: 'Театральная постановка "Море"',
    categories: ['Театры', 'Развлечения'],
    image: '/Theater.jpeg',
    price: 1500,
    description: 'Спектакль о море в местном театре',
    rating: 4.7,
    'Жанр': 'драма',
    'Время начала': '19:30',
    'Цена билета': 1500,
    'Доступность': true,
    city: "Зеленоградск",
    checkedIn: 67,
  },
  {
    id: 108,
    name: 'Янтарный карнавал',
    categories: ['Развлечения', 'Семейный выход'],
    image: '/Category.activity.jpeg',
    price: 0,
    description: 'Городской карнавал с парадом',
    rating: 4.6,
    'Время начала': '15:00',
    'Доступность': true,
    city: "Янтарный",
    checkedIn: 456,
  },
])

export interface CarouselInfo {
  name:string
  image:string
  attractions?: number
  description?: string
}

export interface Guide {
  id: number
  name: string
  avatar: string
  city: string
  rating: number
  languages: string[]
  specialties: string[]
  experience: number // years
  price: number // per hour
  description: string
  available: boolean
}

export interface WeatherData {
  city: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  forecast: {
    day: string
    temp: number
    condition: string
  }[]
}

export const categoriesData = ref<CarouselInfo[]>([
  { name: 'Экскурсии', attractions: 70, image: '/Excursions.jpeg' },
  { name: 'Где поесть', attractions: 245, image: '/Category.resto.jpeg' },
  { name: 'Размещение', attractions: 123, image: '/Category.hotels.jpeg' },
  { name: 'Активный отдых', attractions: 53, image: '/Category.activity.jpeg' },
  { name: 'Исторические места', attractions: 321, image: '/historical_sites.jpeg' },
  { name: 'Концерты', attractions: 76, image: '/Category.concerts.jpeg' },
  { name: 'Театры', attractions: 123, image: '/Theater.jpeg' },
  { name: 'Семейный выход', attractions: 123, image: '/Category.family.jpeg' },
  { name: 'Кино', attractions: 123, image: '/Movie.jpeg' },
  { name: 'Мастер-классы', attractions: 123, image: '/Workshop.jpeg' },
  { name: 'Музеи', attractions: 123, image: '/Museums.jpeg' },
  { name: 'Парки/cкверы', attractions: 123, image: '/Parks.jpeg' },
  { name: 'Отпускной транспорт', attractions: 123, image: '/transport.jpeg' },
  { name: 'Выставки', attractions: 123, image: '/Exhibition.jpeg' },
])

export const citiesData = ref<CarouselInfo[]>([
  { name: 'Калининград', image: '/Kaliningrad.jpeg',attractions:70 },
  { name: 'Светлогорск', image: '/Svetlogorsk.jpeg',attractions:53 },
  { name: 'Зеленоградск', image: '/Zelenogradsk.jpeg',attractions:321 },
  { name: 'Янтарный', image: '/Yantarnyi.jpeg',attractions:245 },
  { name: 'Советск', image: '/Sovetsk.jpeg',attractions:76 },
  { name: 'Балтийск', image: '/Baltiysk.jpeg',attractions:72 },
  { name: 'Черняховск', image: '/Chernyakhovsk.jpeg',attractions:123 },
  { name: 'Гвардейск', image: '/Gvardeysk.jpeg',attractions:43 },
  { name: 'Гусев', image: '/Gusev.jpeg',attractions:70 },
  { name: 'Багратионовск', image: '/Bagrationovsk.jpeg',attractions:70 },
  { name: 'Пионерский', image: '/Pionerskiy.jpeg',attractions:70 },
  { name: 'Гурьевск', image: '/Guryevsk.jpeg',attractions:70 },
  { name: 'Озерск', image: '/Ozersk.jpeg',attractions:70 },
  { name: 'Железнодорожный', image: '/Zheleznodorozhniy.jpeg',attractions:70 },
  { name: 'Нестеров', image: '/Nesterov.jpeg',attractions:70 },
  { name: 'Правдинск', image: '/Pravdinsk.jpeg',attractions:70 },
  { name: 'Краснознаменск', image: '/Krasnoznamensk.jpeg',attractions:70 },
  { name: 'Славск', image: '/Slavsk.jpeg',attractions:70 },
])

export const allGuides = ref<Guide[]>([
  {
    id: 1,
    name: 'Анна Петрова',
    avatar: '/guide1.png',
    city: 'Калининград',
    rating: 4.9,
    languages: ['Русский', 'Английский'],
    specialties: ['История', 'Архитектура'],
    experience: 5,
    price: 2000,
    description: 'Профессиональный гид по историческому центру Калининграда',
    available: true,
  },
  {
    id: 2,
    name: 'Михаил Соколов',
    avatar: '/guide2.png',
    city: 'Светлогорск',
    rating: 4.8,
    languages: ['Русский', 'Немецкий'],
    specialties: ['Курортная архитектура', 'Природа'],
    experience: 3,
    price: 1800,
    description: 'Специалист по курортной архитектуре Светлогорска',
    available: true,
  },
  {
    id: 3,
    name: 'Елена Морозова',
    avatar: '/guide3.png',
    city: 'Зеленоградск',
    rating: 4.7,
    languages: ['Русский', 'Английский', 'Польский'],
    specialties: ['Природа', 'Экология'],
    experience: 4,
    price: 1600,
    description: 'Экологический гид по природным достопримечательностям',
    available: true,
  },
  {
    id: 4,
    name: 'Дмитрий Волков',
    avatar: '/guide1.png',
    city: 'Янтарный',
    rating: 4.6,
    languages: ['Русский'],
    specialties: ['Янтарь', 'Геология'],
    experience: 6,
    price: 1500,
    description: 'Специалист по янтарю и геологии региона',
    available: false,
  },
])

export const weatherData = ref<WeatherData[]>([
  {
    city: 'Калининград',
    temperature: 18,
    condition: 'Солнечно',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Сегодня', temp: 18, condition: 'Солнечно' },
      { day: 'Завтра', temp: 16, condition: 'Облачно' },
      { day: 'Послезавтра', temp: 19, condition: 'Дождь' },
    ]
  },
  {
    city: 'Светлогорск',
    temperature: 17,
    condition: 'Облачно',
    humidity: 70,
    windSpeed: 15,
    forecast: [
      { day: 'Сегодня', temp: 17, condition: 'Облачно' },
      { day: 'Завтра', temp: 15, condition: 'Дождь' },
      { day: 'Послезавтра', temp: 18, condition: 'Солнечно' },
    ]
  },
  {
    city: 'Зеленоградск',
    temperature: 16,
    condition: 'Дождь',
    humidity: 80,
    windSpeed: 18,
    forecast: [
      { day: 'Сегодня', temp: 16, condition: 'Дождь' },
      { day: 'Завтра', temp: 14, condition: 'Облачно' },
      { day: 'Послезавтра', temp: 17, condition: 'Солнечно' },
    ]
  },
  {
    city: 'Янтарный',
    temperature: 19,
    condition: 'Солнечно',
    humidity: 60,
    windSpeed: 10,
    forecast: [
      { day: 'Сегодня', temp: 19, condition: 'Солнечно' },
      { day: 'Завтра', temp: 17, condition: 'Облачно' },
      { day: 'Послезавтра', temp: 20, condition: 'Солнечно' },
    ]
  },
])



export const categoriesCarouselData = ref<CarouselInfo[]>([
  { name: 'Экскурсии', attractions: 70, image: '/Excursions.mp4' },
  { name: 'Где поесть', attractions: 245, image: '/food.mp4' },
  { name: 'Размещение', attractions: 123, image: '/hotels.mp4' },
  { name: 'Активный отдых', attractions: 53, image: '/activity.mp4' },
  { name: 'Исторические места', attractions: 321, image: '/Historical.mp4' },
  { name: 'Концерты', attractions: 76, image: '/music.mp4' },
  { name: 'Театры', attractions: 123, image: '/Theater.jpeg' },
  { name: 'Семейный выход', attractions: 123, image: '/Category.family.jpeg' },
  { name: 'Кино', attractions: 123, image: '/Movie.jpeg' },
  { name: 'Мастер-классы', attractions: 123, image: '/clayWorkshop.mp4' },
  { name: 'Музеи', attractions: 123, image: '/museums.mp4' },
  { name: 'Парки/cкверы', attractions: 123, image: '/Parks.jpeg' },
  { name: 'Отпускной транспорт', attractions: 123, image: '/transport.jpeg' },
  { name: 'Выставки', attractions: 123, image: '/Exhibition.jpeg' },
])

export interface RegionCity {
  id: string
  name: string
  lat: number
  lng: number
  isRegionalCenter: boolean
}

export const regionCitiesCatalog: RegionCity[] = [
  { id: 'kaliningrad', name: 'Калининград', lat: 54.7104, lng: 20.4522, isRegionalCenter: true },
  { id: 'svetlogorsk', name: 'Светлогорск', lat: 54.9439, lng: 20.1438, isRegionalCenter: false },
  { id: 'zelenogradsk', name: 'Зеленоградск', lat: 54.9586, lng: 20.4756, isRegionalCenter: false },
  { id: 'yantarny', name: 'Янтарный', lat: 54.8715, lng: 19.9408, isRegionalCenter: false },
  { id: 'sovetsk', name: 'Советск', lat: 55.0816, lng: 21.8886, isRegionalCenter: false },
  { id: 'baltiysk', name: 'Балтийск', lat: 54.6514, lng: 19.9140, isRegionalCenter: false },
  { id: 'chernyakhovsk', name: 'Черняховск', lat: 54.6244, lng: 21.7969, isRegionalCenter: false },
  { id: 'gvardeysk', name: 'Гвардейск', lat: 54.6518, lng: 21.0606, isRegionalCenter: false },
  { id: 'gusev', name: 'Гусев', lat: 54.5900, lng: 22.1992, isRegionalCenter: false },
  { id: 'bagrationovsk', name: 'Багратионовск', lat: 54.3872, lng: 20.6417, isRegionalCenter: false },
  { id: 'pionersky', name: 'Пионерский', lat: 54.9500, lng: 20.2270, isRegionalCenter: false },
  { id: 'gurevsk', name: 'Гурьевск', lat: 54.7708, lng: 20.6036, isRegionalCenter: false },
  { id: 'ozersk', name: 'Озерск', lat: 54.4106, lng: 22.0158, isRegionalCenter: false },
  { id: 'zheleznodorozhny', name: 'Железнодорожный', lat: 54.3433, lng: 21.3039, isRegionalCenter: false },
  { id: 'nesterov', name: 'Нестеров', lat: 54.6319, lng: 22.5666, isRegionalCenter: false },
  { id: 'pravdinsk', name: 'Правдинск', lat: 54.4432, lng: 21.0080, isRegionalCenter: false },
  { id: 'krasnoznamensk', name: 'Краснознаменск', lat: 54.9456, lng: 22.4924, isRegionalCenter: false },
  { id: 'slavsk', name: 'Славск', lat: 55.0497, lng: 21.6761, isRegionalCenter: false },
  { id: 'polessk', name: 'Полесск', lat: 54.8623, lng: 21.0994, isRegionalCenter: false },
  { id: 'neman', name: 'Неман', lat: 55.0317, lng: 22.0325, isRegionalCenter: false },
  { id: 'ladushkin', name: 'Ладушкин', lat: 54.5696, lng: 20.1701, isRegionalCenter: false },
  { id: 'mamonovo', name: 'Мамоново', lat: 54.4646, lng: 19.9392, isRegionalCenter: false },
]

// Trail interface for FirstHandExperience
export interface Trail {
  id: number
  title: string
  cover: string
  media: string[]
  duration: number
  distance: number
  difficulty: 'лёгкий' | 'средний' | 'сложный'
  tags: string[]
  facilities: { 
    toilets: boolean; 
    rest: boolean; 
    playground: boolean; 
    accessible: boolean;
    parking: boolean;
    wifi: boolean;
    cafe: boolean;
    water: boolean;
    shelter: boolean;
    lighting: boolean;
    security: boolean;
  }
  payment: {
    cash: boolean;
    card: boolean;
  }
  costs?: {
    selectedType: 'для одного' | 'для семьи' | 'для группы';
    amount: string;
    notes: string;
  }
  ratings: {
    overall: number;
    scenery: number;
    access: number;
    comfort: number;
  }
  stops: {
    title: string;
    note?: string;
    lat: number;
    lng: number;
  }[]
  comments: {
    user: { name: string; avatar: string };
    text: string;
    date: string;
    media?: string[];
  }[]
  owner: { name: string; avatar: string }
  featured?: boolean
  summary?: string
}

export const allTrails = ref<Trail[]>([])

export async function fetchRegionCities(): Promise<RegionCity[]> {
  return Promise.resolve(regionCitiesCatalog.map(c => ({ ...c })))
}

// City-based filtering utilities
export function getAttractionsByCity(city: string): Attraction[] {
  return allAttractions.value.filter(attraction => attraction.city === city)
}

export function getGuidesByCity(city: string): Guide[] {
  return allGuides.value.filter(guide => guide.city === city)
}

export function getTrailsByCity(city: string): Trail[] {
  return allTrails.value.filter(trail => {
    // For trails, we can check if any stops are in the selected city
    // For now, let's assume trails are city-specific based on their title or description
    return trail.title.toLowerCase().includes(city.toLowerCase()) || 
           trail.summary?.toLowerCase().includes(city.toLowerCase())
  })
}

export function getAttractionsByCategoryAndCity(category: string, city: string): Attraction[] {
  return allAttractions.value.filter(attraction => 
    attraction.categories.includes(category) && attraction.city === city
  )
}

export function getEventsByCity(city: string): Attraction[] {
  // Events are attractions with categories like 'Концерты', 'Театры', etc.
  const eventCategories = ['Концерты', 'Театры', 'Кино', 'Развлечения']
  return allAttractions.value.filter(attraction => 
    attraction.city === city && 
    attraction.categories.some(cat => eventCategories.includes(cat))
  )
}

export function getWeatherByCity(city: string): WeatherData | undefined {
  return weatherData.value.find(weather => weather.city === city)
}