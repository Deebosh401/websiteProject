export type ExcursionType = 'турфирма' | 'мини группа'
export type TransportType = 'автобус' | 'индивидуально' | 'пешком' | 'прочее'
export type DurationRange = '1-3ч' | '3-5ч' | '5-8ч' | 'весь день'
export type Season = 'лето' | 'зима' | 'только хорошая погода'
export type PriceLevel = 'бюджетные' | 'средние' | 'дорогие' | 'премиум'
export type PlaceType = 'ресторан' | 'кафе' | 'бар' | 'кофейня' | 'пиццерия'

export interface Attraction {
  id: number
  name: string
  category: string
  image?: string
  date?: string
  going?: number
  price?: number | null
  location?: string
  meetingPoint?: string
  endPoint?: string
  whatsapp?: string
  instagram?: string
  description?: string
  reviews?: Review[]
  rating?: number
  excursionType?: ExcursionType
  transportType?: TransportType
  duration?: DurationRange
  accessible?: boolean
  familyFriendly?: boolean
  season?: Season
  cuisine?: string[]
  priceLevel?: PriceLevel
  openHours?: string 
  placeType?: PlaceType
  canReserve?: boolean
}

export interface Review {
  user: string
  rating: number
  comment: string
  date: string
  level:string
}

export const allAttractions: Attraction[] = [
  {
    id: 1,
    name: 'Аэротруба',
    category: 'Активный отдых',
    image: '/Aerotruba.jpg',
    date: '2025-08-23T10:45:00',
    going: 80,
    price: 0,
    location: 'Спортцентр Калининград',
    meetingPoint: 'Главный вход',
    endPoint: 'Там же',
    whatsapp: 'https://chat.whatsapp.com/example1',
    instagram: 'https://instagram.com/example1',
    description: 'Посещение аэротрубы',
    rating:4.6,
  },
  {
    id: 3,
    name: 'Экскурсия по замкам Калининградской области',
    category: 'Исторические места',
    image: '/zamki.png',
    date: '2025-09-15T12:00:00',
    price: 1000,
    going: 25,
    location: 'Южный вокзал, Калининград',
    meetingPoint: 'Южный вокзал',
    endPoint: 'пос. Низовье',
    whatsapp: 'https://chat.whatsapp.com/example2',
    instagram: 'https://instagram.com/example2',
    description: 'Поездка по кирхам и замкам области',
    rating:4.6,
    excursionType: 'турфирма',
    transportType: 'автобус',
    duration: '3-5ч',
    accessible: true,
    familyFriendly: true,
    season: 'лето',
  },
  {
    id: 2,
    name: 'Итальянский ресторан La Dolce Vita',
    category: 'Где поесть',
    image: '/DolceVita.jpg',
    price: 2500,
    description: 'Итальянский ресторан в центре города',
    rating:4.6,
    cuisine: ['европейская'],
    priceLevel: 'дорогие',
    placeType: 'ресторан',
    canReserve: true,
  },
  {
    id: 4,
    name: 'Аэротруба',
    category: 'Активный отдых',
    image: '/Aerotruba.jpg',
    date: '2025-08-23T10:45:00',
    going: 80,
    price: 0,
    location: 'Спортцентр Калининград',
    meetingPoint: 'Главный вход',
    endPoint: 'Там же',
    whatsapp: 'https://chat.whatsapp.com/example1',
    instagram: 'https://instagram.com/example1',
    description: 'Посещение аэротрубы',
    rating:4.6,
  },
  {
    id: 5,
    name: 'Аэротруба',
    category: 'Активный отдых',
    image: '/Aerotruba.jpg',
    date: '2025-08-23T10:45:00',
    going: 80,
    price: 0,
    location: 'Спортцентр Калининград',
    meetingPoint: 'Главный вход',
    endPoint: 'Там же',
    whatsapp: 'https://chat.whatsapp.com/example1',
    instagram: 'https://instagram.com/example1',
    description: 'Посещение аэротрубы',
    rating:4.6,
  },
]