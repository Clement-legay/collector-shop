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
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/article/:id',
        name: 'article-detail',
        component: () => import('../views/ArticleDetail.vue')
    },
    {
        path: '/seller/:id',
        name: 'seller-profile',
        component: () => import('../views/SellerProfile.vue')
    },
    {
        path: '/publish',
        name: 'publish',
        component: () => import('../views/PublishArticle.vue'),
        meta: { requiresAuth: true, requiresSeller: true }
    },
    {
        path: '/publish/:id',
        name: 'edit-article',
        component: () => import('../views/PublishArticle.vue'),
        meta: { requiresAuth: true, requiresSeller: true }
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
    } else if (to.meta.requiresSeller && authStore.user?.role !== 'seller') {
        next('/dashboard')
    } else {
        next()
    }
})

export default router
