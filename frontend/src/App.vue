<template>
  <div id="app">
    <nav class="navbar">
      <div class="container navbar-content">
        <div class="nav-brand">
          <router-link to="/">[ Collector.shop ]</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/catalog">Catalogue</router-link>
          <router-link to="/publish" v-if="isAuthenticated">Publier</router-link>
          <router-link to="/admin/fraud" v-if="isAdmin">Admin</router-link>
          <router-link to="/login" v-if="!isAuthenticated" class="btn btn-secondary btn-sm">Connexion</router-link>
          <button v-else @click="logout" class="btn btn-secondary btn-sm">Déconnexion</button>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.role === 'admin')

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand a {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-main);
  text-decoration: none;
  letter-spacing: -0.05em;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text-main);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 3rem 0;
  background: white;
}
</style>
