# Payment Service

## Description
Service de gestion des paiements et transactions pour Collector.shop. Simule les transactions d'achat entre acheteurs et vendeurs.

## Port
`3003`

## Responsabilités
- Initiation des transactions de paiement
- Validation et finalisation des paiements
- Historique des transactions par utilisateur
- Émission d'événements pour la détection de fraudes

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/payments/initiate` | Initier un paiement |
| POST | `/payments/:id/complete` | Finaliser un paiement |
| GET | `/payments/user/:userId` | Historique d'un utilisateur |
| GET | `/payments/:id` | Détail d'une transaction |

## Événements Émis (RabbitMQ)

| Event | Routing Key | Trigger |
|-------|-------------|---------|
| `PaymentInitiated` | `payment.initiated` | Paiement démarré |
| `PaymentCompleted` | `payment.completed` | Paiement finalisé |
| `PurchaseCompleted` | `payment.purchase_completed` | Achat terminé |

## Base de Données
- **Schema** : `payments`
- **Tables** : `transactions`

## Variables d'Environnement

```env
PORT=3003
DATABASE_URL=postgresql://user:pass@localhost:5432/collector?schema=payments
RABBITMQ_URL=amqp://localhost:5672
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6832
```

## Démarrage

```bash
npm install
npm run start:dev
```
