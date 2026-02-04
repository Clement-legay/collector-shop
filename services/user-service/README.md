# User Service

## Description
Service de gestion des utilisateurs et d'authentification pour Collector.shop. Gère l'inscription, la connexion et la génération de tokens JWT.

## Port
`3002`

## Responsabilités
- Inscription et authentification des utilisateurs
- Génération et validation de tokens JWT
- Gestion des profils utilisateurs
- Émission d'événements utilisateur pour le tracking

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/users/register` | Inscription nouvel utilisateur |
| POST | `/users/login` | Connexion (retourne JWT) |
| GET | `/users/profile` | Profil de l'utilisateur connecté |
| PUT | `/users/profile` | Modifier son profil |
| GET | `/users/:id` | Profil public d'un utilisateur |

## Événements Émis (RabbitMQ)

| Event | Routing Key | Trigger |
|-------|-------------|---------|
| `UserRegistered` | `user.registered` | Nouvel utilisateur inscrit |
| `UserUpdated` | `user.updated` | Profil modifié |

## Base de Données
- **Schema** : `users`
- **Tables** : `users`

## Variables d'Environnement

```env
PORT=3002
DATABASE_URL=postgresql://user:pass@localhost:5432/collector?schema=users
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=24h
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6832
```

## Démarrage

```bash
npm install
npm run start:dev
```
