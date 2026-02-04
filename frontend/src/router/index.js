import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/',
        name: 'home',
        redirect: '/catalog'
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/catalog',
        name: 'catalog',
        component: () => import('../views/Catalog.vue')
    },
    {
        path: '/article/:id',
        name: 'article-detail',
        component: () => import('../views/ArticleDetail.vue')
    },
    {
        path: '/publish',
        name: 'publish',
        component: () => import('../views/PublishArticle.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/fraud',
        name: 'admin-fraud',
        component: () => import('../views/AdminFraud.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
        next('/catalog')
    } else {
        next()
    }
})

export default router
