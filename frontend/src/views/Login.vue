<template>
  <div class="login-page fade-in">
    <div class="login-card card">
      <h1 class="page-title text-center">Connexion</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-control"
            placeholder="votre@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-control"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="register-link">
        Pas encore de compte ? 
        <router-link to="/register">S'inscrire</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const result = await authStore.login(email.value, password.value)
  
  loading.value = false
  
  if (result.success) {
    router.push('/catalog')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
}

.btn-block {
  width: 100%;
  margin-top: 1rem;
}

.error-message {
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-light);
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
