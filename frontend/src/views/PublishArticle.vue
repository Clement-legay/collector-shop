<template>
  <div class="publish-page fade-in">
    <div class="publish-card card">
      <h1 class="page-title">Publier un article</h1>

      <form @submit.prevent="handleSubmit">
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
        </div>

        <div class="form-group">
          <label for="photos">URL de l'image</label>
          <input
            type="url"
            id="photos"
            v-model="photoUrl"
            class="form-control"
            placeholder="https://exemple.com/image.jpg"
          />
          <p class="form-hint">Ajoutez une URL d'image pour votre article</p>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">✅ Article publié avec succès !</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Publication...' : 'Publier l\'article' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  title: '',
  description: '',
  price: null
})

const photoUrl = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const payload = {
      ...form,
      sellerId: authStore.user.id,
      photos: photoUrl.value ? [photoUrl.value] : [],
      status: 'published'
    }

    await api.post('/api/articles', payload)
    
    success.value = true
    
    // Redirect after success
    setTimeout(() => {
      router.push('/catalog')
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la publication'
  } finally {
    loading.value = false
  }
}
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
</style>
