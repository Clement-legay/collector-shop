# Collector.shop

Marketplace d'objets de collection entre particuliers avec détection de fraudes en temps réel.

## 🏗️ Architecture

```
┌─────────────────┐        REST API        ┌───────────────────────────────────────────┐
│   Vue.js 3      │◄─────────────────────►│  User  │  Article  │  Payment  Services  │
│   Frontend      │                        └──────────────────────┬────────────────────┘
│   (Nginx)       │                                               │ Events (RabbitMQ)
└─────────────────┘                                               ▼
                                                        ┌─────────────────────┐
                                                        │  Fraud Detection    │
                                                        │  Service            │
                                                        └─────────────────────┘
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| [User Service](./services/user-service/) | 3002 | Authentification JWT & gestion utilisateurs |
| [Article Service](./services/article-service/) | 3001 | CRUD articles de collection + recherche |
| [Payment Service](./services/payment-service/) | 3003 | Transactions & réservation d'articles |
| [Fraud Detection](./services/fraud-detection-service/) | 3004 | Détection de fraudes en temps réel |
| [Frontend](./frontend/) | 80 | Interface Vue.js servie par Nginx |

## 🛠️ Stack Technique

- **Backend** : NestJS (TypeScript)
- **Frontend** : Vue.js 3 + Vite
- **Base de données** : PostgreSQL (schémas isolés par service)
- **Message Broker** : RabbitMQ (communication événementielle)
- **Orchestration** : Kubernetes (Minikube)
- **CI/CD** : GitHub Actions + ArgoCD
- **IaC** : Terraform (AWS)
- **Observabilité** : Prometheus + Grafana + Jaeger

## 🚀 Quick Start (Kubernetes)

### Prérequis
- Node.js 18+
- Docker Desktop
- Minikube
- kubectl
- k6 (pour les tests de charge)

### Démarrage

```bash
# 1. Démarrer Minikube
npm start

# 2. Build des images + déploiement Kubernetes
npm run dev

# 3. Ajouter au /etc/hosts
echo "192.168.49.2 collector.local" | sudo tee -a /etc/hosts

# 4. Seeder la base de données
npm run seed
```

### Accès

| Service | URL |
|---------|-----|
| Frontend | http://collector.local |
| API | http://collector.local/api |
| Grafana | http://collector.local/grafana |
| Jaeger | http://collector.local/jaeger |
| Prometheus | http://collector.local/prometheus |

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@collector.com | Collect0r!2026 |
| Vendeur | tony@stark.com | Collect0r!2026 |
| Acheteur | joe@collect.com | Collect0r!2026 |

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Simulation de fraude (5 achats rapides)
npm run simulate:fraud

# Test de charge (k6 — montée jusqu'à 50 VUs)
npm run test:load
```

## 📁 Structure du Projet

```
collector-shop/
├── .github/workflows/        # CI/CD (GitHub Actions)
├── docs/                     # Documentation technique
│   ├── architecture.md
│   ├── api-contracts.md
│   ├── deployment-minikube.md
│   ├── deployment-aws.md
│   └── cesi/                 # Consignes et grilles d'évaluation
├── frontend/                 # Vue.js 3 + Vite
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── infrastructure/
│   ├── kubernetes/           # Manifests K8s (services, DBs, ingress, observabilité)
│   ├── terraform/            # IaC AWS (EKS, RDS, VPC)
│   └── argocd/               # Configuration ArgoCD
├── scripts/
│   ├── devops/               # Build, deploy, start Minikube
│   ├── data/                 # Seed, simulation de fraude
│   └── tests/                # Tests de charge (k6)
├── services/
│   ├── article-service/      # NestJS — Gestion articles
│   ├── fraud-detection-service/  # NestJS — Détection fraudes
│   ├── payment-service/      # NestJS — Paiements
│   └── user-service/         # NestJS — Utilisateurs & auth
├── docker-compose.yml        # Infrastructure locale (PostgreSQL, RabbitMQ, monitoring)
├── package.json              # Monorepo (npm workspaces)
└── README.md
```

## 📚 Documentation

- [Architecture détaillée](./docs/architecture.md)
- [Contrats API (REST, Events, SQL)](./docs/api-contracts.md)
- [Déploiement Minikube](./docs/deployment-minikube.md)
- [Déploiement AWS](./docs/deployment-aws.md)
- [CI/CD](./docs/ci-cd.md)
- [ArgoCD](./docs/argocd-setup.md)
