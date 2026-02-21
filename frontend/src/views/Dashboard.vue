<template>
  <div class="dashboard-page fade-in">
    <div class="dashboard-header">
      <h1 class="page-title">Tableau de bord</h1>
      <div v-if="user?.role === 'buyer'" class="shop-action">
        <p>Vous souhaitez vendre ?</p>
        <button @click="openShop" class="btn btn-primary" :disabled="loadingRole">
          Ouvrir ma boutique
        </button>
        <button @click="logout" class="btn btn-secondary danger-hover">Déconnexion</button>
      </div>
      <div v-else class="shop-action">
        <span class="badge badge-green">Vendeur vérifié</span>
        <button @click="logout" class="btn btn-secondary danger-hover">Déconnexion</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'orders' }"
        @click="activeTab = 'orders'"
      >
        Mes Achats
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'sales' }"
        @click="activeTab = 'sales'"
        v-if="user?.role === 'seller'"
      >
        Mes Ventes
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'profile' }"
        @click="activeTab = 'profile'"
      >
        Mon Profil
      </button>
    </div>

    <!-- Orders Tab -->
    <div v-if="activeTab === 'orders'" class="tab-content">
      <div v-if="orders.length === 0" class="empty-state">
        <p>Aucune commande effectuée.</p>
        <router-link to="/catalog" class="btn btn-secondary">Voir le catalogue</router-link>
      </div>
      
      <div v-else class="transactions-list">
        <div v-for="order in orders" :key="order.id" class="transaction-card card">
          <div class="transaction-header">
            <span class="date">{{ formatDate(order.createdAt) }}</span>
            <span class="status" :class="`status-${order.status}`">
              {{ statusLabel(order.status) }}
            </span>
          </div>
          <div class="transaction-body">
            <h3>{{ order.article?.title || 'Chargement...' }}</h3>
            <p class="amount">{{ formatPrice(order.amount) }} €</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Tab -->
    <div v-if="activeTab === 'sales' && user?.role === 'seller'" class="tab-content">
      
      <!-- Active Articles Section -->
      <section class="dashboard-section">
        <h2>Articles en vente</h2>
        <div v-if="myArticles.length === 0" class="empty-state">
          <p>Aucun article en vente.</p>
          <router-link to="/publish" class="btn btn-primary">Publier un article</router-link>
        </div>
        <div v-else class="transactions-list">
          <div v-for="article in myArticles" :key="article.id" class="transaction-card card">
            <div class="transaction-header">
              <span class="date">Publié le {{ formatDate(article.createdAt) }}</span>
              <span class="status" :class="`status-${article.status}`">
                {{ article.status }}
              </span>
            </div>
            <div class="transaction-body">
              <h3>{{ article.title }}</h3>
              <p class="amount">{{ formatPrice(article.price) }} €</p>
            </div>
             <div class="transaction-actions">
              <router-link :to="`/publish/${article.id}`" class="btn btn-secondary btn-sm">Modifier</router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Sales History Section -->
      <section class="dashboard-section">
        <h2>Historique des ventes</h2>
        <div v-if="sales.length === 0" class="empty-state">
          <p>Aucune vente pour le moment.</p>
        </div>

        <div v-else class="transactions-list">
          <div v-for="sale in sales" :key="sale.id" class="transaction-card card">
            <div class="transaction-header">
              <span class="date">{{ formatDate(sale.createdAt) }}</span>
              <span class="status" :class="`status-${sale.status}`">
                {{ statusLabel(sale.status) }}
              </span>
            </div>
            <div class="transaction-body">
              <h3>{{ sale.article?.title || 'Chargement...' }}</h3>
              <p class="amount">{{ formatPrice(sale.amount) }} €</p>
            </div>
            
            <div v-if="sale.status === 'pending'" class="transaction-actions">
              <button @click="validateSale(sale.id, true)" class="btn btn-secondary btn-sm success-hover">Accepter</button>
              <button @click="validateSale(sale.id, false)" class="btn btn-secondary btn-sm danger-hover">Refuser</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Profile Tab -->
    <div v-if="activeTab === 'profile'" class="tab-content profile-tab">
      <div class="card profile-card">
        <h2>Mes Informations</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>Email (non modifiable)</label>
            <input type="email" :value="user.email" disabled class="form-control" />
          </div>
          <div class="form-group">
            <label for="name">Nom complet</label>
            <input type="text" id="name" v-model="profileForm.name" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="address">Adresse de livraison</label>
            <textarea id="address" v-model="profileForm.address" class="form-control" rows="3" placeholder="Votre adresse complète..."></textarea>
          </div>
          
          <p v-if="profileMessage" :class="profileSuccess ? 'success-message' : 'error-message'">
            {{ profileMessage }}
          </p>

          <button type="submit" class="btn btn-primary" :disabled="loadingProfile">
            {{ loadingProfile ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const activeTab = ref('orders')
const orders = ref([])
const sales = ref([])
const myArticles = ref([])
const loadingRole = ref(false)

// Profile state
const loadingProfile = ref(false)
const profileMessage = ref('')
const profileSuccess = ref(false)
const profileForm = reactive({
  name: '',
  address: ''
})

// Initialize form when user data is available
watch(user, (newUser) => {
  if (newUser) {
    profileForm.name = newUser.name || ''
    profileForm.address = newUser.address || ''
  }
}, { immediate: true })

const statusLabel = (status) => {
  const map = {
    pending: 'En attente',
    completed: 'Validé',
    cancelled: 'Refusé',
    failed: 'Échoué'
  }
  return map[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(price)
}

const fetchOrders = async () => {
  if (!user.value) return
  try {
    const res = await api.get(`/api/payments/user/${user.value.id}`)
    orders.value = await enrichWithArticles(res.data)
  } catch (e) {
    console.error(e)
  }
}

const fetchSales = async () => {
  if (!user.value || user.value.role !== 'seller') return
  try {
    const res = await api.get(`/api/payments/seller/${user.value.id}`)
    sales.value = await enrichWithArticles(res.data)
  } catch (e) {
    console.error(e)
  }
}

const fetchMyArticles = async () => {
  if (!user.value || user.value.role !== 'seller') return
  try {
    const res = await api.get(`/api/articles`, {
      params: { sellerId: user.value.id }
    })
    myArticles.value = res.data
  } catch (e) {
    console.error("Failed to fetch my articles", e)
  }
}

const enrichWithArticles = async (transactions) => {
  const enriched = await Promise.all(transactions.map(async (t) => {
    try {
      const res = await api.get(`/api/articles/${t.articleId}`)
      return { ...t, article: res.data }
    } catch (e) {
      return { ...t, article: { title: 'Article introuvable' } }
    }
  }))
  return enriched
}

const openShop = async () => {
  if (!confirm("Voulez-vous devenir vendeur et ouvrir votre boutique ?")) return
  
  loadingRole.value = true
  try {
    // unused : const res = await api.put(`/api/users/${user.value.id}`, { role: 'seller' })
    // Update local user state
    authStore.updateUser({ ...user.value, role: 'seller' })
    await fetchSales()
    activeTab.value = 'sales'
  } catch (e) {
    console.error("Failed to open shop", e)
    alert("Erreur lors de l'ouverture de la boutique")
  } finally {
    loadingRole.value = false
  }
}

const updateProfile = async () => {
  loadingProfile.value = true
  profileMessage.value = ''
  
  try {
    const res = await api.put(`/api/users/${user.value.id}`, {
      name: profileForm.name,
      address: profileForm.address
    })
    
    // Update store
    authStore.updateUser({ ...user.value, ...res.data })
    
    profileSuccess.value = true
    profileMessage.value = 'Profil mis à jour avec succès'
  } catch (e) {
    console.error("Failed to update profile", e)
    profileSuccess.value = false
    profileMessage.value = 'Erreur lors de la mise à jour'
  } finally {
    loadingProfile.value = false
  }
}

const validateSale = async (transactionId, approved) => {
  try {
    await api.post(`/api/payments/${transactionId}/validate`, { approved })
    // Refresh list
    await fetchSales()
  } catch (e) {
    console.error("Validation failed", e)
    alert("Erreur lors de la validation")
  }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  fetchOrders()
  if (user.value?.role === 'seller') {
    fetchSales()
    fetchMyArticles()
  }
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.dashboard-section {
  margin-bottom: 3rem;
}

.dashboard-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-main);
  border-bottom: 2px solid var(--background-light);
  padding-bottom: 0.5rem;
  display: inline-block;
}

.shop-action {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.shop-action p {
  color: var(--text-light);
  font-size: 0.9rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: var(--text-light);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--text-main);
  border-bottom-color: var(--text-main);
}

.tab-btn:hover {
  color: var(--text-main);
}

/* Transactions */
.transactions-list {
  display: grid;
  gap: 1rem;
}

.transaction-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.transaction-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date {
  font-size: 0.85rem;
  color: var(--text-light);
}

.status {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.status-pending { color: var(--warning-color); }
.status-completed { color: var(--success-color); }
.status-cancelled { color: var(--danger-color); }

.transaction-body h3 {
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.transaction-actions {
  display: flex;
  gap: 0.5rem;
}

.success-hover:hover {
  background-color: var(--success-color);
  color: white;
  border-color: var(--success-color);
}

.danger-hover:hover {
  background-color: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}

.profile-card {
  max-width: 600px;
  padding: 2rem;
}

.profile-card h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.success-message {
  color: var(--success-color);
  font-weight: 600;
  margin-top: 1rem;
}

.error-message {
  color: var(--danger-color);
  margin-top: 1rem;
}
</style>
