# Fraud Detection Service

## Description
Service événementiel de détection de fraudes en temps réel pour Collector.shop. Écoute tous les événements RabbitMQ et détecte les comportements suspects.

## Port
`3004` (métriques uniquement)

## Type
**Service événementiel pur** - Pas d'API REST, uniquement consommateur d'événements.

## Responsabilités
- Écoute de tous les événements métier (article, user, payment)
- Détection de fraudes selon les règles configurées
- Enregistrement des alertes en base de données
- Exposition de métriques Prometheus

## Règles de Détection

### 1. Manipulation de Prix
| Variation | Fenêtre | Niveau |
|-----------|---------|--------|
| > 500% | 1 heure | 🟠 ORANGE |
| > 1000% | 1 heure | 🔴 ROUGE |

### 2. Achats Rapides
| Nombre d'achats | Fenêtre | Niveau |
|-----------------|---------|--------|
| > 5 | 10 minutes | 🟠 ORANGE |
| > 10 | 10 minutes | 🔴 ROUGE |

## Événements Écoutés (RabbitMQ)

| Routing Key Pattern | Source |
|--------------------|--------|
| `article.*` | Article Service |
| `user.*` | User Service |
| `payment.*` | Payment Service |

## Métriques Prometheus

| Métrique | Type | Labels |
|----------|------|--------|
| `fraud_alerts_total` | Counter | `type`, `severity` |
| `fraud_detection_latency` | Histogram | `rule` |
| `events_processed_total` | Counter | `event_type` |

## Base de Données
- **Schema** : `fraud`
- **Tables** : `alerts`, `price_changes`, `purchase_tracking`

## Variables d'Environnement

```env
PORT=3004
DATABASE_URL=postgresql://user:pass@localhost:5432/collector?schema=fraud
RABBITMQ_URL=amqp://localhost:5672
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6832
PRICE_CHANGE_ORANGE_THRESHOLD=500
PRICE_CHANGE_RED_THRESHOLD=1000
RAPID_PURCHASE_ORANGE_THRESHOLD=5
RAPID_PURCHASE_RED_THRESHOLD=10
RAPID_PURCHASE_WINDOW_MINUTES=10
```

## Démarrage

```bash
npm install
npm run start:dev
```
