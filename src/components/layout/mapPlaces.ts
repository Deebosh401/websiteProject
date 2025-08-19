export type PlaceCategory =
  | 'Исторические места'
  | 'Где поесть'
  | 'Парки/скверы'
  | 'ТРЦ'
  | 'Музеи'

export interface MapPlace {
  id: number
  name: string
  category: PlaceCategory
  lat: number
  lng: number
  rating?: number
  address?: string
  description?: string
  image?: string
  gallery?: string[]
  attractionId?: number
}

export const allPlaceCategories: PlaceCategory[] = [
  'Исторические места',
  'Где поесть',
  'Парки/скверы',
  'ТРЦ',
  'Музеи',
]

export const mapPlaces: MapPlace[] = [
  {
    id: 1,
    name: 'Кафедральный собор',
    category: 'Исторические места',
    lat: 54.7104,
    lng: 20.5100,
    rating: 4.8,
    address: 'Калининград, остров Канта',
    description: 'Готический собор XIV века, сердце старого Кёнигсберга.',
    image: '/historical_sites.jpeg',
    gallery: ['/historical_sites.jpeg', '/Museums.jpeg', '/Parks.jpeg'],
    attractionId: 3
  },
  {
    id: 2,
    name: 'Музей Мирового океана',
    category: 'Музеи',
    lat: 54.7077,
    lng: 20.5075,
    rating: 4.7,
    address: 'Набережная Петра Великого, 1',
    description: 'Экспозиции о морях и океанах, научные суда и аквариумы.',
    image: '/Museums.jpeg',
    gallery: ['/Museums.jpeg', '/Exhibition.jpeg']
  },
  {
    id: 3,
    name: 'Центральный парк',
    category: 'Парки/скверы',
    lat: 54.7225,
    lng: 20.5070,
    rating: 4.5,
    address: 'Проспект Мира, 10',
    description: 'Зеленые аллеи, аттракционы и тихие прогулочные зоны.',
    image: '/Parks.jpeg',
    gallery: ['/Parks.jpeg']
  },
  {
    id: 4,
    name: 'ТРЦ Европа',
    category: 'ТРЦ',
    lat: 54.7088,
    lng: 20.5079,
    rating: 4.4,
    address: 'Площадь Победы, 1',
    description: 'Крупный торгово-развлекательный центр в центре города.'
  },
  {
    id: 5,
    name: 'La Dolce Vita',
    category: 'Где поесть',
    lat: 54.7115,
    lng: 20.5005,
    rating: 4.6,
    address: 'Центр города',
    description: 'Итальянская кухня и уютная атмосфера.',
    image: '/DolceVita.jpg',
    gallery: ['/DolceVita.jpg'],
    attractionId: 2
  },
  {
    id: 6,
    name: 'Руины замка Кёнигсберг',
    category: 'Исторические места',
    lat: 54.7065,
    lng: 20.5155,
    rating: 4.3,
    address: 'Центр, рядом с Домом Советов',
    description: 'Фрагменты легендарного Кёнигсбергского замка.',
    image: '/historical_sites.jpeg'
  },
  {
    id: 7,
    name: 'Парк Юности',
    category: 'Парки/скверы',
    lat: 54.7185,
    lng: 20.5060,
    rating: 4.4,
    address: 'Озеро Верхнее',
    description: 'Прогулки у воды, детские площадки и прокат лодок.',
    image: '/Parks.jpeg'
  },
  {
    id: 8,
    name: 'Музей Янтаря',
    category: 'Музеи',
    lat: 54.7167,
    lng: 20.5093,
    rating: 4.7,
    address: 'Площадь Маршала Василевского',
    description: 'Уникальная коллекция янтаря и изделий из него.',
    image: '/Museums.jpeg'
  },
]

export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

export function buildYandexMapsUrl(lat: number, lng: number): string {
  return `https://yandex.ru/maps/?pt=${lng},${lat}&z=15&l=map`
}

export function buildGoogleDirectionsUrl(lat: number, lng: number): string {
  // Uses current location as origin
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function buildYandexDirectionsUrl(lat: number, lng: number): string {
  // rtext: from ~ to; empty means current location
  return `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`
}


