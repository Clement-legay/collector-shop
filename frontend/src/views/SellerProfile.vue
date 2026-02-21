<template>
  <div class="seller-profile fade-in">
    <div v-if="loading" class="text-center">Chargement...</div>
    <div v-else-if="!seller" class="text-center">Vendeur introuvable</div>
    
    <div v-else>
      <div class="profile-header card">
        <h1>Boutique de {{ seller.name }}</h1>
        <p class="text-light">Membre depuis le {{ formatDate(seller.createdAt) }}</p>
      </div>

      <h2 class="section-title">Articles en vente ({{ articles.length }})</h2>

      <div v-if="articles.length === 0" class="empty-state">
        Ce vendeur n'a aucun article en vente pour le moment.
      </div>

      <div v-else class="grid grid-3">
        <ArticleCard 
          v-for="article in articles" 
          :key="article.id" 
          :article="article" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import ArticleCard from '../components/ArticleCard.vue'

const route = useRoute()
const seller = ref(null)
const articles = ref([])
const loading = ref(true)

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

const fetchData = async () => {
  const sellerId = route.params.id
  try {
    const [userRes, articlesRes] = await Promise.all([
      api.get(`/api/users/${sellerId}`),
      api.get(`/api/articles?sellerId=${sellerId}&status=published`)
    ])
    seller.value = userRes.data
    articles.value = articlesRes.data
  } catch (e) {
    console.error("Failed to fetch seller data", e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.profile-header {
  text-align: center;
  margin-bottom: 3rem;
  background: var(--bg-secondary);
}

.profile-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  color: var(--text-light);
  padding: 2rem;
}
</style>
