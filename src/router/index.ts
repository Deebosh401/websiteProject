import { createRouter,createWebHistory } from "vue-router"
import DefaultLayout from "../components/layout/DefaultLayout.vue"
import HomePage from "../pages/HomePage.vue"
import AllCitiesRoutePage from "../pages/AllCitiesRoutePage.vue"
import AllCategoriesRoutePage from "../pages/AllCategoriesRoutePage.vue"

const routes = [

    {   path:"/",
        component: DefaultLayout,
        children: [
        {path:"", name:"home", component: HomePage,},
        {path: "cities", name: "all-cities", component: AllCitiesRoutePage },
        {path: "categories", name: "all-categories", component: AllCategoriesRoutePage },
        {path: '/city/:name',name: 'city-detail',component: () => import('../pages/CityDetailPage.vue')},
        ]
    }
]

const router = createRouter({

    history:createWebHistory(),
    routes,
    scrollBehavior(){
        return{top:0}
    }
});

export default router