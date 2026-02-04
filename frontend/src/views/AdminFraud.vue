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
        
        <div class="alert-details">
          <div v-if="alert.alertType === 'price_variation'">
            <p><strong>Article ID:</strong> {{ alert.articleId }}</p>
            <p><strong>Variation:</strong> {{ alert.details?.percentChange?.toFixed(0) }}%</p>
            <p>
              <strong>Prix:</strong> 
              {{ alert.details?.oldPrice }} € → {{ alert.details?.newPrice }} €
            </p>
          </div>
          
          <div v-else-if="alert.alertType === 'suspicious_purchases'">
            <p><strong>Acheteur ID:</strong> {{ alert.userId }}</p>
            <p><strong>Nombre d'achats:</strong> {{ alert.details?.purchaseCount }} en {{ alert.details?.windowMinutes }} min</p>
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
    suspicious_purchases: '🛒 Achats suspects'
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

const fetchAlerts = async () => {
  try {
    const response = await api.get('/api/fraud/alerts')
    alerts.value = response.data
  } catch (error) {
    console.error('Failed to fetch fraud alerts:', error)
  } finally {
    loading.value = false
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

.alert-details {
  color: var(--text-light);
}

.alert-details p {
  margin: 0.25rem 0;
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
}
</style>
