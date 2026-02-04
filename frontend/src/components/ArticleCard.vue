<template>
  <div class="article-card card" @click="goToDetail">
    <div class="article-image">
      <img 
        :src="article.photos?.[0] || defaultImage" 
        :alt="article.title"
      />
      <span class="article-status" :class="`status-${article.status}`">
        {{ statusLabel }}
      </span>
    </div>
    <div class="article-info">
      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-price">{{ formatPrice(article.price) }} €</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image'

const statusLabel = computed(() => {
  const labels = {
    draft: 'Brouillon',
    published: 'En vente',
    sold: 'Vendu',
    deleted: 'Supprimé'
  }
  return labels[props.article.status] || props.article.status
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const goToDetail = () => {
  router.push(`/article/${props.article.id}`)
}
</script>

<style scoped>
.article-card {
  cursor: pointer;
  padding: 0;
  overflow: hidden;
}

.article-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.article-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-published {
  background: var(--success-color);
  color: white;
}

.status-sold {
  background: var(--text-light);
  color: white;
}

.status-draft {
  background: var(--warning-color);
  color: white;
}

.article-info {
  padding: 1.25rem;
}

.article-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.article-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}
</style>
