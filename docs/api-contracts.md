# Collector.shop - API Contracts

## REST API Endpoints

### Article Service (Port 3001)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/articles` | Liste tous les articles | - | `Article[]` |
| GET | `/articles/:id` | Détail d'un article | - | `Article` |
| POST | `/articles` | Créer un article | `CreateArticleDto` | `Article` |
| PUT | `/articles/:id` | Modifier un article (Full) | `UpdateArticleDto` | `Article` |
| PUT | `/articles/:id/price` | Changer le prix | `UpdatePriceDto` | `Article` |
| PUT | `/articles/:id/status` | Changer le statut | `{"status": "..."}` | `Article` |
| DELETE | `/articles/:id` | Supprimer un article | - | `void` |

**CreateArticleDto**
```json
{
  "title": "string",
  "description": "string (optional)",
  "price": 0.00,
  "sellerId": "string (UUID)",
  "photos": ["string (url)"] /* Optional */,
  "status": "draft | published | pending | sold | deleted" /* Optional */
}
```

### User Service (Port 3002)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/users/register` | Inscription | `RegisterDto` | `User + JWT` |
| POST | `/users/login` | Connexion | `LoginDto` | `JWT` |
| GET | `/users` | Liste tous les utilisateurs | - | `User[]` |
| GET | `/users/:id` | Profil utilisateur | - | `User` |
| PUT | `/users/:id` | Modifier utilisateur | `UpdateUserDto` | `User` |
| POST | `/users/:id/ban` | Bannir utilisateur | - | `User` |
| POST | `/users/:id/unban` | Débannir utilisateur | - | `User` |

**RegisterDto**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "address": "string (optional)",
  "role": "buyer | seller | admin (optional)"
}
```

### Payment Service (Port 3003)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/payments` | Initier paiement | `InitiatePaymentDto` | `Transaction` |
| GET | `/payments` | Liste des paiements | - | `Transaction[]` |
| GET | `/payments/:id` | Détail transaction | - | `Transaction` |
| GET | `/payments/user/:userId` | Historique acheteur | - | `Transaction[]` |
| GET | `/payments/seller/:userId`| Historique vendeur | - | `Transaction[]` |
| POST | `/payments/:id/validate` | Valider transaction | `{"approved": bool}` | `Transaction` |
| POST | `/payments/:id/complete` | Finaliser transaction | - | `Transaction` |

**InitiatePaymentDto**
```json
{
  "articleId": "string (UUID)",
  "buyerId": "string (UUID)",
  "amount": 0.00
}
```

### Fraud Detection Service (Port 3004)

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/fraud/alerts` | Liste les alertes de fraude | `?type=` ou `?severity=` | `FraudAlert[]` |
| GET | `/fraud/stats` | Statistiques de fraude | - | `StatsObject` |

---

## PostgreSQL Database Schemas (TypeORM Generated)

### Schema: articles.articles
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Auto-generated |
| `title` | varchar | - |
| `description` | text | nullable |
| `price` | decimal(10,2) | - |
| `previous_price` | decimal(10,2) | nullable |
| `seller_id` | UUID | - |
| `photos` | jsonb | default: `[]` |
| `status` | enum | `draft`, `published`, `pending`, `sold`, `deleted` |
| `created_at` | timestamp | default `now()` |
| `updated_at` | timestamp | default `now()` |

### Schema: users.users
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Auto-generated |
| `email` | varchar | unique |
| `password` | varchar | plain text for POC |
| `name` | varchar | - |
| `address` | varchar | nullable |
| `role` | enum | `buyer`, `seller`, `admin` |
| `isActive` | boolean | default `true` |
| `created_at` | timestamp | default `now()` |
| `updated_at` | timestamp | default `now()` |

### Schema: payments.transactions
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Auto-generated |
| `article_id` | UUID | - |
| `buyer_id` | UUID | - |
| `seller_id` | UUID | - |
| `amount` | decimal(10,2) | - |
| `status` | enum | `pending`, `completed`, `failed`, `cancelled` |
| `created_at` | timestamp | default `now()` |
| `updated_at` | timestamp | default `now()` |

### Schema: fraud.fraud_alerts
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Auto-generated |
| `alert_type` | enum | `price_variation`, `suspicious_purchases`, `high_risk_user` |
| `severity` | enum | `green`, `orange`, `red` |
| `user_id` | UUID | nullable |
| `article_id` | UUID | nullable |
| `details` | jsonb | nullable |
| `created_at` | timestamp | default `now()` |
