<template>
  <div class="catalog-page fade-in">
    <div class="catalog-header">
      <h1 class="page-title">Catalogue</h1>
      <router-link to="/publish" class="btn btn-primary">
        + Publier un article
      </router-link>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Chargement des articles...</p>
    </div>

    <div v-else-if="articles.length === 0" class="empty-state">
      <p>Aucun article disponible pour le moment.</p>
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
import { ref, onMounted } from 'vue'
import api from '../services/api'
import ArticleCard from '../components/ArticleCard.vue'

const articles = ref([])
const loading = ref(true)

const fetchArticles = async () => {
  try {
    const response = await api.get('/api/articles')
    articles.value = response.data
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
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

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);
}
</style>
