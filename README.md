# Collector.shop

Marketplace d'objets de collection entre particuliers avec détection de fraudes en temps réel.

## 🏗️ Architecture

```
┌─────────────┐     REST      ┌──────────────────────────────────────┐
│   Vue.js    │◄────────────►│  Article │ User │ Payment Services   │
│   Frontend  │               └──────────────────────────────────────┘
└─────────────┘                              │
                                             │ Events
                                             ▼
                                    ┌─────────────────┐
                                    │    RabbitMQ     │
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Fraud Detection │
                                    └─────────────────┘
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| [Article Service](./services/article-service/) | 3001 | CRUD articles de collection |
| [User Service](./services/user-service/) | 3002 | Auth & gestion utilisateurs |
| [Payment Service](./services/payment-service/) | 3003 | Transactions de paiement |
| [Fraud Detection](./services/fraud-detection-service/) | 3004 | Détection fraudes temps réel |
| [Frontend](./frontend/) | 5173 | Interface Vue.js |

## 🛠️ Stack Technique

- **Backend** : NestJS (TypeScript)
- **Frontend** : Vue.js 3 + Vite
- **Database** : PostgreSQL
- **Message Broker** : RabbitMQ
- **Orchestration** : Kubernetes (Minikube)
- **Observabilité** : Jaeger + Prometheus + Grafana

## 📚 Documentation

- [Architecture](./docs/architecture.md) - Diagramme et description technique
- [API Contracts](./docs/api-contracts.md) - Endpoints REST, Events, Schémas SQL

## 🚀 Quick Start

### Prérequis
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- RabbitMQ 3.12+

### Démarrage Local

```bash
# Démarrer l'infrastructure
docker-compose up -d postgres rabbitmq

# Démarrer les services (dans des terminaux séparés)
cd services/article-service && npm install && npm run start:dev
cd services/user-service && npm install && npm run start:dev
cd services/payment-service && npm install && npm run start:dev
cd services/fraud-detection-service && npm install && npm run start:dev

# Démarrer le frontend
cd frontend && npm install && npm run dev
```

## 📁 Structure

```
collector-shop/
├── services/
│   ├── article-service/
│   ├── user-service/
│   ├── payment-service/
│   └── fraud-detection-service/
├── frontend/
├── infrastructure/
│   ├── kubernetes/
│   ├── terraform/
│   └── docker/
└── docs/
```

## 📋 Roadmap

- [x] **Prompt 1** : Architecture & Structure
- [ ] **Prompt 2** : Implémentation microservices
- [ ] **Prompt 3** : Infrastructure K8s & Terraform
