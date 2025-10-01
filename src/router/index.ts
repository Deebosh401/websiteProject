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
      { path: '/city/:city/trips', name: 'city-trips', component: () => import('../pages/CityTripsPage.vue') },
      { path: '/event/:id', name: 'event-detail', component: () => import('../pages/EventDetail.vue') },
      { path: '/category/:name', name: 'category-detail', component: () => import('../pages/CategoryDetailPage.vue') },
      { path: '/all-events', name: 'all-events', component: () => import('../pages/AllEventsPage.vue') },
      { path: '/all-popular', name: 'all-popular', component: () => import('../pages/AllPopularPage.vue') },
      { path: '/guides', name: 'guides', component: () => import('../pages/GuidesPage.vue') },
      { path: '/seo', name: 'seo', component: () => import('../pages/SEOPage.vue') },
      { path: '/admin', name: 'admin-panel', component: () => import('../pages/admin/AdminPanel.vue') },
      { path: '/user', name: 'user-dashboard', component: () => import('../pages/user/UserDashboard.vue') },
      { path: '/guide', name: 'guide-panel', component: () => import('../pages/guide/GuidePanel.vue') },
      { path: '/business', name: 'business-panel', component: () => import('../pages/business/BusinessPanel.vue') },
      { path: '/chat', name: 'chat', component: () => import('../pages/ChatPage.vue') },
    ]
  },
  {
    path: "/auth",
    children: [
      { path: "login", name: "login", component: () => import("../pages/auth/LoginPage.vue") },
      { path: "register", name: "register", component: () => import("../pages/auth/RegisterPage.vue") },
      { path: "forgot-password", name: "forgot-password", component: () => import("../pages/auth/ForgotPasswordPage.vue") },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  console.log('Route navigation:', { from: from.path, to: to.path, params: to.params })
  next()
})

export default router
