
<script lang = "ts">

export interface Category {
  name: string
  attractionsCount?: number 
}

export interface City {
  name: string
  description: string
  image: string
  attractions: number
  isRegionalCenter?: boolean
  categories: Category[]
}

export const cities: City[] = [
  {
    name: 'Калининград',
    description: 'Город янтаря и немецкого наследия',
    image: '/Kaliningrad.jpeg',
    attractions: 50,
    isRegionalCenter: true,
    categories: [
      { name: 'История', attractionsCount: 12 },
      { name: 'Экскурсии', attractionsCount: 10 },
      { name: 'Где поесть' },
    ],
  },
  {
    name: 'Светлогорск',
    description: 'Курортный город на берегу Балтийского моря',
    image: '/Svetlogorsk.jpeg',
    attractions: 70,
    categories: [
      { name: 'Семейный отдых' },
      { name: 'Концерты' },
    ],
  },
  {
    name: 'Зеленоградск',
    description: 'Город котиков и морского бриза',
    image: '/Zelenogradsk.jpeg',
    attractions: 60,
    categories: [
      { name: 'Где поесть' },
      { name: 'Размещение' },
    ],
  },
  {
    name: 'Янтарный',
    description: 'Кладовая янтаря на побережье',
    image: '/Yantarnyi.jpeg',
    attractions: 40,
    categories: [
      { name: 'Экскурсии' },
    ],
  },
  {
    name: 'Советск',
    description: 'Город с мостом Королевы Луизы',
    image: '/Sovetsk.jpeg',
    attractions: 30,
    categories: [
      { name: 'История' },
    ],
  },
]
</script>