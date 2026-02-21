<template>
  <div class="admin-fraud-page fade-in">
    <h1 class="page-title">🚨 Dashboard Fraudes</h1>

    <div class="stats-grid">
      <div class="stat-card card">
        <h3>Total Alertes</h3>
        <p class="stat-value">{{ alerts.length }}</p>
      </div>
      <div class="stat-card card stat-orange">
        <h3>Alertes Orange</h3>
        <p class="stat-value">{{ orangeCount }}</p>
      </div>
      <div class="stat-card card stat-red">
        <h3>Alertes Rouge</h3>
        <p class="stat-value">{{ redCount }}</p>
      </div>
    </div>

    <div class="filters">
      <select v-model="filterType" class="form-control filter-select">
        <option value="">Tous les types</option>
        <option value="price_variation">Variation de prix</option>
        <option value="suspicious_purchases">Achats suspects</option>
        <option value="high_risk_user">Utilisateurs à haut risque</option>
      </select>

      <select v-model="filterSeverity" class="form-control filter-select">
        <option value="">Toutes les sévérités</option>
        <option value="orange">Orange</option>
        <option value="red">Rouge</option>
      </select>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Chargement des alertes...</p>
    </div>

    <div v-else-if="filteredAlerts.length === 0" class="empty-state">
      <p>Aucune alerte de fraude détectée.</p>
    </div>

    <div v-else class="alerts-list">
      <div 
        v-for="alert in filteredAlerts" 
        :key="alert.id" 
        class="alert-item card"
        :class="`alert-${alert.severity}`"
      >
        <div class="alert-header">
          <span class="badge" :class="`badge-${alert.severity}`">
            {{ alert.severity.toUpperCase() }}
          </span>
          <span class="alert-type">{{ formatType(alert.alertType) }}</span>
          <span class="alert-date">{{ formatDate(alert.createdAt) }}</span>
        </div>
        
        <div class="alert-layout">
          <div class="alert-details">
            <div v-if="alert.alertType === 'price_variation'">
              <p><strong>Article :</strong> {{ alert.article?.title || `ID: ${alert.articleId}` }}</p>
              <p><strong>Variation:</strong> {{ alert.details?.percentChange?.toFixed(0) }}%</p>
              <p>
                <strong>Prix:</strong> 
                {{ alert.details?.oldPrice }} € → {{ alert.details?.newPrice }} €
              </p>
            </div>
            
            <div v-else-if="alert.alertType === 'suspicious_purchases'">
              <p>
                <strong>Utilisateur :</strong> 
                {{ alert.user?.name || `ID: ${alert.userId}` }} 
                <span v-if="alert.user?.email">({{ alert.user.email }})</span>
              </p>
              <p><strong>Nombre d'achats:</strong> {{ alert.details?.purchaseCount }} en {{ alert.details?.windowMinutes }} min</p>
            </div>

            <div v-else-if="alert.alertType === 'high_risk_user'">
               <p>
                <strong>Utilisateur :</strong> 
                {{ alert.user?.name || `ID: ${alert.userId}` }} 
                <span v-if="alert.user?.email">({{ alert.user.email }})</span>
              </p>
              <p><strong>Score de Fraude:</strong> {{ alert.details?.score }}</p>
              <p><strong>Message:</strong> {{ alert.details?.message }}</p>
            </div>
          </div>

          <!-- Actions Panel -->
          <div class="alert-actions" v-if="alert.user">
             <div class="user-status-badge">
               <span v-if="alert.user.isActive" class="badge badge-success">Actif</span>
               <span v-else class="badge badge-danger">Banni</span>
             </div>
             
             <button 
                v-if="alert.user.isActive" 
                @click="toggleBan(alert.user)" 
                class="btn btn-secondary danger-hover btn-sm"
                :disabled="alert.user.loading"
             >
                {{ alert.user.loading ? '...' : 'Bannir' }}
             </button>
             <button 
                v-else 
                @click="toggleBan(alert.user)" 
                class="btn btn-secondary success-hover btn-sm"
                :disabled="alert.user.loading"
             >
               {{ alert.user.loading ? '...' : 'Débannir' }}
             </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const alerts = ref([])
const loading = ref(true)
const filterType = ref('')
const filterSeverity = ref('')

const filteredAlerts = computed(() => {
  return alerts.value.filter(alert => {
    if (filterType.value && alert.alertType !== filterType.value) return false
    if (filterSeverity.value && alert.severity !== filterSeverity.value) return false
    return true
  })
})

const orangeCount = computed(() => 
  alerts.value.filter(a => a.severity === 'orange').length
)

const redCount = computed(() => 
  alerts.value.filter(a => a.severity === 'red').length
)

const formatType = (type) => {
  const types = {
    price_variation: '💰 Variation de prix',
    suspicious_purchases: '🛒 Achats suspects',
    high_risk_user: '🚫 Utilisateur à haut risque'
  }
  return types[type] || type
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Map to cache user data to avoid redundant API calls
const usersCache = new Map()
const articlesCache = new Map()

const fetchUserData = async (userId) => {
  if (!userId) return null;
  if (usersCache.has(userId)) return usersCache.get(userId);
  try {
    const res = await api.get(`/api/users/${userId}`);
    const userData = { ...res.data, loading: false };
    usersCache.set(userId, userData);
    return userData;
  } catch (e) {
    console.error(`Failed to fetch user ${userId}`, e);
    return null;
  }
}

const fetchArticleData = async (articleId) => {
  if (!articleId) return null;
  if (articlesCache.has(articleId)) return articlesCache.get(articleId);
  try {
    const res = await api.get(`/api/articles/${articleId}`);
    articlesCache.set(articleId, res.data);
    return res.data;
  } catch (e) {
    console.error(`Failed to fetch article ${articleId}`, e);
    return null;
  }
}

const fetchAlerts = async () => {
  try {
    const response = await api.get('/api/fraud/alerts')
    const rawAlerts = response.data

    // Enrich alerts with user and article data
    const enrichedAlerts = await Promise.all(rawAlerts.map(async (alert) => {
      let user = null;
      let article = null;
      
      if (alert.userId) {
        user = await fetchUserData(alert.userId);
      }
      
      // Some alerts might contain user ID in details
      if (!user && alert.details?.userId) {
         user = await fetchUserData(alert.details.userId);
      }
      
      if (alert.articleId) {
        article = await fetchArticleData(alert.articleId);
      }

      return {
        ...alert,
        user,
        article
      }
    }))

    alerts.value = enrichedAlerts
  } catch (error) {
    console.error('Failed to fetch fraud alerts:', error)
  } finally {
    loading.value = false
  }
}

const toggleBan = async (user) => {
  if (!user) return;
  const action = user.isActive ? 'ban' : 'unban';
  const confirmMsg = user.isActive 
    ? `Voulez-vous vraiment bannir l'utilisateur ${user.name} ?`
    : `Voulez-vous vraiment débannir l'utilisateur ${user.name} ?`;
    
  if (!confirm(confirmMsg)) return;
  
  user.loading = true;
  try {
    const res = await api.post(`/api/users/${user.id}/${action}`);
    user.isActive = res.data.isActive;
  } catch (e) {
    console.error(`Failed to ${action} user`, e);
    alert(`Erreur lors de l'opération.`);
  } finally {
    user.loading = false;
  }
}

onMounted(() => {
  fetchAlerts()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.stat-orange .stat-value {
  color: var(--warning-color);
}

.stat-red .stat-value {
  color: var(--danger-color);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-select {
  max-width: 250px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  border-left: 4px solid transparent;
}

.alert-item.alert-orange {
  border-left-color: var(--warning-color);
}

.alert-item.alert-red {
  border-left-color: var(--danger-color);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.alert-type {
  font-weight: 600;
}

.alert-date {
  margin-left: auto;
  color: var(--text-light);
  font-size: 0.875rem;
}

.alert-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.alert-details {
  color: var(--text-light);
  flex: 1;
}

.alert-details p {
  margin: 0.25rem 0;
}

.alert-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 150px;
}

.user-status-badge {
  margin-bottom: 0.5rem;
}

.badge-success {
  background-color: var(--success-color);
  color: white;
}

.badge-danger {
  background-color: var(--danger-color);
  color: white;
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

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-select {
    max-width: 100%;
  }
  
  .alert-layout {
    flex-direction: column;
  }
  
  .alert-actions {
    align-items: flex-start;
    margin-top: 1rem;
  }
}
</style>
