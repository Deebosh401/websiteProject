// src/filterConfig.ts
export interface FilterConfig {
  [key: string]: any
}

export const filterOptions: FilterConfig = {
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

  'Экскурсии': {
    priceRange: {
      label: 'Цена',
      type: 'range',
      min: 0,
      max: 5000,
      step: 100,
    },
    excursionType: {
      label: 'Тип экскурсии',
      type: 'single',
      options: ['турфирма', 'мини группа'],
    },
    transportType: {
      label: 'Тип передвижения',
      type: 'single',
      options: ['автобус', 'индивидуально', 'пешком', 'прочее'],
    },
    duration: {
      label: 'Длительность',
      type: 'single',
      options: ['1-3ч', '3-5ч', '5-8ч', 'весь день'],
    },
    accessible: {
      label: 'Доступно для людей с ограниченными возможностями',
      type: 'single',
      options: ['да', 'нет'],
    },
    familyFriendly: {
      label: 'Подходит для семьи',
      type: 'single',
      options: ['да', 'нет'],
    },
    season: {
      label: 'Сезонность',
      type: 'single',
      options: ['лето', 'зима', 'только хорошая погода'],
    },
  },
}
