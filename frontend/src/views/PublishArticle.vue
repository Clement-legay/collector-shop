<template>
  <div class="publish-page fade-in">
    <div class="publish-card card">
      <h1 class="page-title">{{ isEditMode ? 'Modifier l\'article' : 'Publier un article' }}</h1>

      <div v-if="loadingArticle" class="loading-state">
        <p>Chargement de l'article...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">Titre *</label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            class="form-control"
            placeholder="Ex: Carte Pokémon Dracaufeu 1ère édition"
            required
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-control"
            rows="4"
            placeholder="Décrivez votre article en détail..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="price">Prix (€) *</label>
          <input
            type="number"
            id="price"
            v-model.number="form.price"
            class="form-control"
            placeholder="99.99"
            min="0"
            step="0.01"
            required
          />
          <p v-if="isEditMode && originalPrice !== null && form.price !== originalPrice" class="price-change-hint">
            <span v-if="priceChangeRatio > 5" class="warning">
              ⚠️ Variation de prix importante ({{ priceChangePercent }}%) — une alerte de fraude sera générée
            </span>
            <span v-else class="info">
              Prix original : {{ formatPrice(originalPrice) }} € → Nouveau : {{ formatPrice(form.price) }} €
            </span>
          </p>
        </div>

        <div class="form-group">
          <label for="photoUrl">URL de la photo</label>
          <input
            type="url"
            id="photoUrl"
            v-model="photoUrl"
            class="form-control"
            placeholder="https://example.com/image.jpg"
          />
          <p class="form-hint">Lien vers une image de l'article</p>
          
          <div v-if="photoUrl" class="image-preview">
            <img :src="photoUrl" alt="Aperçu" @error="handleImageError" />
            <button @click.prevent="removePhoto" class="btn-remove">×</button>
          </div>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ isEditMode ? '✅ Article mis à jour !' : '✅ Article publié avec succès !' }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? (isEditMode ? 'Mise à jour...' : 'Publication...') : (isEditMode ? 'Enregistrer les modifications' : 'Publier l\'article') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const articleId = computed(() => route.params.id)
const isEditMode = computed(() => !!articleId.value)

const form = reactive({
  title: '',
  description: '',
  price: null
})

const photoUrl = ref('')
const loading = ref(false)
const loadingArticle = ref(false)
const error = ref('')
const success = ref(false)
const originalPrice = ref(null)

const priceChangeRatio = computed(() => {
  if (originalPrice.value === null || originalPrice.value === 0 || form.price === null) return 0
  return Math.abs(form.price - originalPrice.value) / originalPrice.value
})

const priceChangePercent = computed(() => {
  return Math.round(priceChangeRatio.value * 100)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(price)
}

const handleImageError = () => {
  error.value = "Impossible de charger l'image depuis cette URL"
}

const removePhoto = () => {
  photoUrl.value = ''
}

// Load article data in edit mode
const loadArticle = async () => {
  if (!isEditMode.value) return

  loadingArticle.value = true
  try {
    const res = await api.get(`/api/articles/${articleId.value}`)
    const article = res.data

    // Verify seller ownership
    if (article.sellerId !== authStore.user.id) {
      error.value = "Vous n'êtes pas le propriétaire de cet article"
      router.push('/dashboard')
      return
    }

    form.title = article.title
    form.description = article.description || ''
    form.price = Number(article.price)
    originalPrice.value = Number(article.price)
    photoUrl.value = article.photos?.[0] || ''
  } catch (err) {
    error.value = 'Impossible de charger l\'article'
    console.error(err)
  } finally {
    loadingArticle.value = false
  }
}

const handleSubmit = async () => {
  if (!photoUrl.value) {
    error.value = "Une photo est requise"
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      photos: [photoUrl.value],
    }

    if (isEditMode.value) {
      // Edit mode: PUT
      await api.put(`/api/articles/${articleId.value}`, payload)
    } else {
      // Create mode: POST
      await api.post('/api/articles', {
        ...payload,
        sellerId: authStore.user.id,
        status: 'published'
      })
    }
    
    success.value = true
    
    // Redirect after success
    setTimeout(() => {
      router.push(isEditMode.value ? '/dashboard' : '/catalog')
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.message || (isEditMode.value ? 'Erreur lors de la mise à jour' : 'Erreur lors de la publication')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.publish-page {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.publish-card {
  width: 100%;
  max-width: 600px;
  padding: 2.5rem;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.btn-block {
  width: 100%;
  margin-top: 1.5rem;
}

.error-message {
  color: var(--danger-color);
  margin-bottom: 1rem;
}

.success-message {
  color: var(--success-color);
  font-weight: 600;
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
  width: 100%;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.btn-remove {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}

.price-change-hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.price-change-hint .warning {
  color: var(--warning-color);
  font-weight: 600;
}

.price-change-hint .info {
  color: var(--text-light);
}
</style>
