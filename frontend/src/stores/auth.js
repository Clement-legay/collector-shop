import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null)
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

    const isAuthenticated = computed(() => !!token.value)

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/users/login', { email, password })
            token.value = response.data.token
            user.value = response.data.user

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            }
        }
    }

    const register = async (userData) => {
        try {
            const response = await api.post('/api/users/register', userData)
            token.value = response.data.token
            user.value = response.data.user

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            }
        }
    }

    const logout = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    const updateUser = (updatedUser) => {
        user.value = updatedUser
        localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    return {
        token,
        user,
        isAuthenticated,
        login,
        register,
        // login,
        // register,
        logout,
        updateUser
    }
})
