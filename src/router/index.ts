import { createRouter, createWebHistory } from "vue-router"
import DefaultLayout from "../components/layout/DefaultLayout.vue"

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", name: "home", component: () => import("../pages/HomePage.vue") },
      { path: "cities", name: "all-cities", component: () => import("../pages/AllCitiesRoutePage.vue") },
      { path: "categories", name: "all-categories", component: () => import("../pages/AllCategoriesRoutePage.vue") },
      { path: '/city/:cityName/event/:eventId', name: 'city-event-detail', component: () => import('../pages/EventDetail.vue') },
      { path: '/city/:name', name: 'city-detail', component: () => import('../pages/CityDetailPage.vue') },
      { path: '/event/:id', name: 'event-detail', component: () => import('../pages/EventDetail.vue') },
      { path: '/category/:name', name: 'category-detail', component: () => import('../pages/CategoryDetailPage.vue') },
      { path: '/all-events', name: 'all-events', component: () => import('../pages/AllEventsPage.vue') },
      { path: '/all-popular', name: 'all-popular', component: () => import('../pages/AllPopularPage.vue') },
      { path: '/guides', name: 'guides', component: () => import('../pages/GuidesPage.vue') },
    ]
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
