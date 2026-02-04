# Article Service

## Description
Service de gestion des articles de collection pour Collector.shop. Expose une API REST pour les opérations CRUD et émet des événements vers RabbitMQ pour la traçabilité des changements.

## Port
`3001`

## Responsabilités
- Création, lecture, modification et suppression d'articles
- Gestion des catégories et conditions
- Historique des changements de prix
- Émission d'événements pour le système de détection de fraudes

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/articles` | Liste tous les articles |
| GET | `/articles/:id` | Détail d'un article |
| POST | `/articles` | Créer un article |
| PUT | `/articles/:id` | Modifier un article |
| DELETE | `/articles/:id` | Supprimer un article |

## Événements Émis (RabbitMQ)

| Event | Routing Key | Trigger |
|-------|-------------|---------|
| `ArticleCreated` | `article.created` | Nouvel article créé |
| `ArticleUpdated` | `article.updated` | Article modifié |
| `PriceChanged` | `article.price_changed` | Prix modifié |

## Base de Données
- **Schema** : `articles`
- **Tables** : `articles`, `price_history`

## Variables d'Environnement

```env
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/collector?schema=articles
RABBITMQ_URL=amqp://localhost:5672
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6832
```

## Démarrage

```bash
npm install
npm run start:dev
```
