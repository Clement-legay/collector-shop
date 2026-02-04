<template>
  <div class="article-detail-page fade-in">
    <div v-if="loading" class="loading-state">
      <p>Chargement...</p>
    </div>

    <div v-else-if="!article" class="error-state">
      <p>Article non trouvé</p>
      <router-link to="/catalog" class="btn btn-secondary">Retour au catalogue</router-link>
    </div>

    <div v-else class="article-container">
      <div class="article-gallery">
        <img 
          :src="article.photos?.[0] || defaultImage" 
          :alt="article.title"
          class="main-image"
        />
      </div>

      <div class="article-details card">
        <span class="article-status" :class="`badge badge-${statusColor}`">
          {{ statusLabel }}
        </span>
        
        <h1 class="article-title">{{ article.title }}</h1>
        
        <p class="article-price">{{ formatPrice(article.price) }} €</p>
        
        <p v-if="article.previousPrice" class="previous-price">
          Ancien prix : {{ formatPrice(article.previousPrice) }} €
        </p>

        <div class="article-description">
          <h3>Description</h3>
          <p>{{ article.description || 'Aucune description fournie.' }}</p>
        </div>

        <div class="article-actions" v-if="article.status === 'published'">
          <button 
            @click="handleBuy" 
            class="btn btn-primary btn-block"
            :disabled="!isAuthenticated || buying"
          >
            {{ buying ? 'Achat en cours...' : 'Acheter maintenant' }}
          </button>
          <p v-if="!isAuthenticated" class="login-hint">
            <router-link to="/login">Connectez-vous</router-link> pour acheter
          </p>
        </div>

        <p v-if="buySuccess" class="success-message">
          ✅ Achat réussi ! Merci pour votre commande.
        </p>

        <p v-if="buyError" class="error-message">
          ❌ {{ buyError }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const article = ref(null)
const loading = ref(true)
const buying = ref(false)
const buySuccess = ref(false)
const buyError = ref('')

const defaultImage = 'https://via.placeholder.com/600x400?text=No+Image'

const isAuthenticated = computed(() => authStore.isAuthenticated)

const statusLabel = computed(() => {
  const labels = {
    draft: 'Brouillon',
    published: 'En vente',
    sold: 'Vendu',
    deleted: 'Supprimé'
  }
  return labels[article.value?.status] || article.value?.status
})

const statusColor = computed(() => {
  const colors = {
    published: 'green',
    sold: 'orange',
    draft: 'orange'
  }
  return colors[article.value?.status] || 'orange'
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const fetchArticle = async () => {
  try {
    const response = await api.get(`/api/articles/${route.params.id}`)
    article.value = response.data
  } catch (error) {
    console.error('Failed to fetch article:', error)
  } finally {
    loading.value = false
  }
}

const handleBuy = async () => {
  if (!authStore.user || !article.value) return

  buying.value = true
  buyError.value = ''
  buySuccess.value = false

  try {
    await api.post('/api/payments', {
      articleId: article.value.id,
      buyerId: authStore.user.id,
      amount: Number(article.value.price)
    })
    
    buySuccess.value = true
    article.value.status = 'sold'
  } catch (error) {
    buyError.value = error.response?.data?.message || 'Erreur lors de l\'achat'
  } finally {
    buying.value = false
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .article-container {
    grid-template-columns: 1fr;
  }
}

.article-gallery {
  position: relative;
}

.main-image {
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.article-details {
  padding: 2rem;
}

.article-status {
  margin-bottom: 1rem;
}

.article-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.article-price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.previous-price {
  color: var(--text-light);
  text-decoration: line-through;
  margin-bottom: 1.5rem;
}

.article-description {
  margin: 1.5rem 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.article-description h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.article-actions {
  margin-top: 2rem;
}

.btn-block {
  width: 100%;
}

.login-hint {
  text-align: center;
  margin-top: 1rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

.login-hint a {
  color: var(--primary-color);
}

.success-message {
  margin-top: 1rem;
  color: var(--success-color);
  font-weight: 600;
}

.error-message {
  margin-top: 1rem;
  color: var(--danger-color);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}
</style>
