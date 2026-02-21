<template>
  <div class="catalog-page fade-in">
    <div class="catalog-header">
      <h1 class="page-title">Catalogue</h1>
      <router-link to="/publish" class="btn btn-primary">
        + Publier un article
      </router-link>
    </div>

    <!-- Filters -->
    <div class="filters-section card">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="filters.search" 
          @input="debounceSearch"
          placeholder="Rechercher un article..." 
          class="form-control"
        />
      </div>
      <div class="price-filters">
        <input 
          type="number" 
          v-model.number="filters.minPrice" 
          @input="debounceSearch"
          placeholder="Prix min" 
          class="form-control"
          min="0"
        />
        <span class="separator">-</span>
        <input 
          type="number" 
          v-model.number="filters.maxPrice" 
          @input="debounceSearch"
          placeholder="Prix max" 
          class="form-control"
          min="0"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Chargement des articles...</p>
    </div>

    <div v-else-if="articles.length === 0" class="empty-state">
      <p>Aucun article trouvé.</p>
    </div>

    <div v-else class="grid grid-3">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../services/api'
import ArticleCard from '../components/ArticleCard.vue'

const articles = ref([])
const loading = ref(true)
const filters = reactive({
  search: '',
  minPrice: null,
  maxPrice: null
})

let timeout = null

const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      status: 'published'
    }
    
    if (filters.search) params.search = filters.search
    if (filters.minPrice !== null && filters.minPrice !== '') params.minPrice = filters.minPrice
    if (filters.maxPrice !== null && filters.maxPrice !== '') params.maxPrice = filters.maxPrice
    
    const response = await api.get('/api/articles', { params })
    articles.value = response.data
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    fetchArticles()
  }, 500)
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-bar {
  flex: 2;
  min-width: 300px;
}

.price-filters {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 250px;
}

.separator {
  color: var(--text-light);
  font-weight: bold;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);
}
</style>
