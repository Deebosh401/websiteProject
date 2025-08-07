import { createRouter,createWebHistory } from "vue-router"
import DefaultLayout from "../components/layout/DefaultLayout.vue"

const routes = [

    {   path:"/",
        component: DefaultLayout,
        children: [
        {path:"", name:"home", component: ()=> import("../pages/HomePage.vue"),},
        {path: "cities", name: "all-cities", component:()=> import("../pages/AllCitiesRoutePage.vue") },
        {path: "categories", name: "all-categories", component:()=> import("../pages/AllCategoriesRoutePage.vue")},
        {path: '/city/:name',name: 'city-detail',component: () => import('../pages/CityDetailPage.vue')},
        {path: '/event/:id',name: 'event-detail',component: () => import('../pages/EventDetail.vue')},

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
