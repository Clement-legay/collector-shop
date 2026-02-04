<template>
  <div class="register-page fade-in">
    <div class="register-card card">
      <h1 class="page-title text-center">Inscription</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nom complet</label>
          <input
            type="text"
            id="name"
            v-model="name"
            class="form-control"
            placeholder="Jean Dupont"
            required
          />
        </div>

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
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label for="role">Type de compte</label>
          <select id="role" v-model="role" class="form-control">
            <option value="buyer">Acheteur</option>
            <option value="seller">Vendeur</option>
          </select>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Inscription...' : 'S\'inscrire' }}
        </button>
      </form>

      <p class="login-link">
        Déjà un compte ? 
        <router-link to="/login">Se connecter</router-link>
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

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('buyer')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  error.value = ''

  const result = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    role: role.value
  })
  
  loading.value = false
  
  if (result.success) {
    router.push('/catalog')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px);
}

.register-card {
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-light);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}
</style>
