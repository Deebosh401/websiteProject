import { ref } from "vue"

export type ExcursionType = 'турфирма' | 'мини группа'
export type TransportType = 'автобус' | 'индивидуально' | 'пешком' | 'прочее'
export type DurationRange = '1-3ч' | '3-5ч' | '5-8ч' | 'весь день'
export type Season = 'лето' | 'зима' | 'только хорошая погода'
export type PriceLevel = 'бюджетные' | 'средние' | 'дорогие' 
export type PlaceType = 'ресторан' | 'кафе' | 'бар' | 'кофейня' | 'пиццерия'

export interface Attraction {
  id: number
  name: string
  category: string
  image?: string
  date?: string
  checkedIn?: number
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
  city:string
}

export interface Review {
  user: string
  rating: number
  comment: string
  date: string
  level:string
}

export const allAttractions = ref<Attraction[]>([
  {
    id: 1,
    name: 'Аэротруба',
    category: 'Активный отдых',
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
    id: 3,
    name: 'Экскурсия по замкам Калининградской области',
    category: 'Исторические места',
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
    excursionType: 'турфирма',
    transportType: 'автобус',
    duration: '3-5ч',
    accessible: true,
    familyFriendly: true,
    season: 'лето',
    city:"Калининград",
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
    city:"Калининград",
    checkedIn:32,
  },
  {
    id: 4,
    name: 'Аэротруба',
    category: 'Активный отдых',
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
    category: 'Активный отдых',
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
])

export interface CarouselInfo {
  name:string
  image:string
  attractions?: number
  description?: string
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
  { name: 'Полесск', image: '/Polessk.jpeg',attractions:70 },
  { name: 'Неман', image: '/Neman.jpeg',attractions:70 },
  { name: 'Ладушкин', image: '/Ladushkin.jpeg',attractions:70 },
  { name: 'Мамоново', image: '/Mamonovo.jpeg',attractions:70 },
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