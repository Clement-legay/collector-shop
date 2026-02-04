# Collector.shop - API Contracts

## REST API Endpoints

### Article Service (Port 3001)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/articles` | Liste tous les articles | - | `Article[]` |
| GET | `/articles/:id` | Détail d'un article | - | `Article` |
| POST | `/articles` | Créer un article | `CreateArticleDto` | `Article` |
| PUT | `/articles/:id` | Modifier un article | `UpdateArticleDto` | `Article` |
| DELETE | `/articles/:id` | Supprimer un article | - | `void` |

**CreateArticleDto**
```json
{
  "title": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "condition": "mint | excellent | good | fair | poor",
  "images": "string[]",
  "sellerId": "string (UUID)"
}
```

**Article Response**
```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "condition": "string",
  "images": "string[]",
  "sellerId": "string (UUID)",
  "status": "available | sold | reserved",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

### User Service (Port 3002)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/users/register` | Inscription | `RegisterDto` | `User + JWT` |
| POST | `/users/login` | Connexion | `LoginDto` | `JWT` |
| GET | `/users/profile` | Profil connecté | - | `User` |
| PUT | `/users/profile` | Modifier profil | `UpdateProfileDto` | `User` |
| GET | `/users/:id` | Profil public | - | `PublicUser` |

**RegisterDto**
```json
{
  "email": "string",
  "password": "string",
  "username": "string",
  "displayName": "string"
}
```

**LoginDto**
```json
{
  "email": "string",
  "password": "string"
}
```

**User Response**
```json
{
  "id": "string (UUID)",
  "email": "string",
  "username": "string",
  "displayName": "string",
  "createdAt": "datetime",
  "token": "string (JWT)"
}
```

---

### Payment Service (Port 3003)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/payments/initiate` | Initier paiement | `InitiatePaymentDto` | `Transaction` |
| POST | `/payments/:id/complete` | Finaliser paiement | - | `Transaction` |
| GET | `/payments/user/:userId` | Historique user | - | `Transaction[]` |
| GET | `/payments/:id` | Détail transaction | - | `Transaction` |

**InitiatePaymentDto**
```json
{
  "articleId": "string (UUID)",
  "buyerId": "string (UUID)",
  "amount": "number"
}
```

**Transaction Response**
```json
{
  "id": "string (UUID)",
  "articleId": "string (UUID)",
  "buyerId": "string (UUID)",
  "sellerId": "string (UUID)",
  "amount": "number",
  "status": "pending | completed | failed | refunded",
  "createdAt": "datetime",
  "completedAt": "datetime | null"
}
```

---

### Fraud Detection Service (Port 3004)

> ⚠️ **Service événementiel pur** - Pas d'API REST

**Endpoints Metrics uniquement :**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/metrics` | Métriques Prometheus |

---

## RabbitMQ Events

### Exchange Configuration
```
Exchange Name: collector.events
Type: topic
Durable: true
```

### Events Schema

#### Article Events

**ArticleCreated** (`article.created`)
```json
{
  "eventType": "ArticleCreated",
  "timestamp": "datetime",
  "data": {
    "id": "string (UUID)",
    "title": "string",
    "price": "number",
    "sellerId": "string (UUID)",
    "category": "string"
  }
}
```

**ArticleUpdated** (`article.updated`)
```json
{
  "eventType": "ArticleUpdated",
  "timestamp": "datetime",
  "data": {
    "id": "string (UUID)",
    "changes": {
      "field": "string",
      "oldValue": "any",
      "newValue": "any"
    }
  }
}
```

**PriceChanged** (`article.price_changed`)
```json
{
  "eventType": "PriceChanged",
  "timestamp": "datetime",
  "data": {
    "articleId": "string (UUID)",
    "oldPrice": "number",
    "newPrice": "number",
    "changePercent": "number",
    "sellerId": "string (UUID)"
  }
}
```

#### User Events

**UserRegistered** (`user.registered`)
```json
{
  "eventType": "UserRegistered",
  "timestamp": "datetime",
  "data": {
    "id": "string (UUID)",
    "email": "string",
    "username": "string"
  }
}
```

**UserUpdated** (`user.updated`)
```json
{
  "eventType": "UserUpdated",
  "timestamp": "datetime",
  "data": {
    "id": "string (UUID)",
    "changes": {
      "field": "string",
      "oldValue": "any",
      "newValue": "any"
    }
  }
}
```

#### Payment Events

**PaymentInitiated** (`payment.initiated`)
```json
{
  "eventType": "PaymentInitiated",
  "timestamp": "datetime",
  "data": {
    "transactionId": "string (UUID)",
    "articleId": "string (UUID)",
    "buyerId": "string (UUID)",
    "amount": "number"
  }
}
```

**PaymentCompleted** (`payment.completed`)
```json
{
  "eventType": "PaymentCompleted",
  "timestamp": "datetime",
  "data": {
    "transactionId": "string (UUID)",
    "articleId": "string (UUID)",
    "buyerId": "string (UUID)",
    "amount": "number"
  }
}
```

**PurchaseCompleted** (`payment.purchase_completed`)
```json
{
  "eventType": "PurchaseCompleted",
  "timestamp": "datetime",
  "data": {
    "transactionId": "string (UUID)",
    "articleId": "string (UUID)",
    "buyerId": "string (UUID)",
    "sellerId": "string (UUID)",
    "amount": "number"
  }
}
```

---

## PostgreSQL Schemas

### Schema: articles

```sql
CREATE TABLE articles.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('mint', 'excellent', 'good', 'fair', 'poor')),
    images TEXT[],
    seller_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE articles.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles.articles(id),
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_seller ON articles.articles(seller_id);
CREATE INDEX idx_articles_category ON articles.articles(category);
CREATE INDEX idx_articles_status ON articles.articles(status);
```

### Schema: users

```sql
CREATE TABLE users.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users.users(email);
CREATE INDEX idx_users_username ON users.users(username);
```

### Schema: payments

```sql
CREATE TABLE payments.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_buyer ON payments.transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON payments.transactions(seller_id);
CREATE INDEX idx_transactions_status ON payments.transactions(status);
CREATE INDEX idx_transactions_created ON payments.transactions(created_at);
```

### Schema: fraud

```sql
CREATE TABLE fraud.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('price_manipulation', 'rapid_purchases')),
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('orange', 'red')),
    entity_type VARCHAR(20) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by UUID
);

CREATE TABLE fraud.price_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_percent DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fraud.purchase_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_type ON fraud.alerts(alert_type);
CREATE INDEX idx_alerts_severity ON fraud.alerts(severity);
CREATE INDEX idx_alerts_created ON fraud.alerts(created_at);
CREATE INDEX idx_price_changes_article ON fraud.price_changes(article_id);
CREATE INDEX idx_price_changes_recorded ON fraud.price_changes(recorded_at);
CREATE INDEX idx_purchase_tracking_user ON fraud.purchase_tracking(user_id);
CREATE INDEX idx_purchase_tracking_recorded ON fraud.purchase_tracking(recorded_at);
```
