# Frontend - Collector.shop

## Description
Application web Vue.js 3 pour Collector.shop. Interface utilisateur pour la marketplace d'objets de collection.

## Port
`5173` (développement Vite)

## Stack
- **Framework** : Vue.js 3 (Composition API)
- **Routing** : Vue Router 4
- **State** : Pinia
- **HTTP Client** : Axios
- **Build Tool** : Vite

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Page d'accueil avec articles récents |
| `/login` | Login | Connexion (JWT simulé en mémoire) |
| `/register` | Register | Inscription utilisateur |
| `/articles` | Catalogue | Liste des articles avec filtres |
| `/articles/:id` | Détail Article | Vue détaillée d'un article |
| `/articles/new` | Publier | Formulaire de création d'article |
| `/profile` | Profil | Profil utilisateur |
| `/admin/fraud` | Dashboard Admin | Liste des alertes de fraude |

## Communication API

| Service | Base URL | Endpoints |
|---------|----------|-----------|
| Article Service | `http://localhost:3001` | `/articles/*` |
| User Service | `http://localhost:3002` | `/users/*` |
| Payment Service | `http://localhost:3003` | `/payments/*` |

## Authentification
- **Mode démo** : JWT généré côté client pour les tests
- **Stockage** : LocalStorage
- **Headers** : `Authorization: Bearer <token>`

## Variables d'Environnement

```env
VITE_ARTICLE_SERVICE_URL=http://localhost:3001
VITE_USER_SERVICE_URL=http://localhost:3002
VITE_PAYMENT_SERVICE_URL=http://localhost:3003
```

## Démarrage

```bash
npm install
npm run dev
```

## Build Production

```bash
npm run build
npm run preview
```
