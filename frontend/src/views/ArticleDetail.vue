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
        <p v-if="seller" class="seller-info">
            Vendu par <router-link :to="'/seller/' + article.sellerId">{{ seller.name }}</router-link>
            <router-link :to="'/seller/' + article.sellerId" class="btn btn-sm btn-outline-primary ml-2">Voir la boutique</router-link>
        </p>
        
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
            {{ buying ? 'Envoi en cours...' : 'Faire une demande d\'achat' }}
          </button>
          <p v-if="!isAuthenticated" class="login-hint">
            <router-link to="/login">Connectez-vous</router-link> pour acheter
          </p>
        </div>

        <p v-if="buySuccess" class="success-message">
          Demande envoyée ! En attente de validation par le vendeur.
        </p>

        <p v-if="buyError" class="error-message">
          Erreur : {{ buyError }}
        </p>
      </div>
    </div>

    <!-- Related Articles -->
    <div v-if="relatedArticles.length > 0" class="related-section fade-in">
      <h2>Autres articles du vendeur</h2>
      <div class="grid grid-3">
        <ArticleCard 
          v-for="related in relatedArticles" 
          :key="related.id" 
          :article="related" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import ArticleCard from '../components/ArticleCard.vue'

const route = useRoute()
const authStore = useAuthStore()

const article = ref(null)
const seller = ref(null)
const relatedArticles = ref([])
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
    pending: 'Réservé',
    sold: 'Vendu',
    deleted: 'Supprimé'
  }
  return labels[article.value?.status] || article.value?.status
})

const statusColor = computed(() => {
  const colors = {
    published: 'green',
    sold: 'orange',
    pending: 'orange',
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

    if (article.value.sellerId) {
        const userRes = await api.get(`/api/users/${article.value.sellerId}`)
        seller.value = userRes.data

        // Fetch related articles
        const relatedRes = await api.get(`/api/articles?sellerId=${article.value.sellerId}`)
        relatedArticles.value = relatedRes.data
          .filter(a => a.id !== article.value.id && a.status === 'published')
          .slice(0, 3)
    }
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
    article.value.status = 'pending'
  } catch (error) {
    buyError.value = error.response?.data?.message || 'Erreur lors de l\'achat'
  } finally {
    buying.value = false
  }
}

onMounted(() => {
  fetchArticle()
})

import { watch } from 'vue'

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchArticle()
    // Scroll to top of the page smoothly when navigating to a new article
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
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
  margin-bottom: 0.5rem;
}

.seller-info {
  color: var(--text-light);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.seller-info a {
  color: var(--primary-color);
  text-decoration: underline;
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
  padding: 4rem 2rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-outline-primary {
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  background: transparent;
}

.btn-outline-primary:hover {
  background: var(--primary-color);
  color: white;
}

.related-section {
  max-width: 1200px;
  margin: 4rem auto;
}

.related-section h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}
</style>
