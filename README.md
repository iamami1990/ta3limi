# Ta3limi - Plateforme Éducative Tunisienne

Plateforme éducative complète pour les élèves du primaire (4e année), collège et lycée en Tunisie.

## 🎯 Fonctionnalités Complétées

### Backend (API Hono + Cloudflare Workers)
- ✅ API REST complète avec authentification JWT
- ✅ Gestion des utilisateurs (élèves, parents, enseignants, admin)
- ✅ CRUD complet pour les cours
- ✅ Système de quizz interactifs avec correction automatique
- ✅ Suivi de progression détaillé
- ✅ Système d'abonnements (gratuit/premium)
- ✅ Intégration LiveKit pour sessions live
- ✅ Upload de fichiers sur Cloudflare R2
- ✅ Stockage KV pour tokens JWT et flags premium

### Frontend (React 18 + TypeScript)
- ✅ 12 pages complètes:
  1. `/` - Accueil avec présentation
  2. `/login` - Connexion
  3. `/register` - Inscription
  4. `/dashboard/eleve` - Dashboard Élève
  5. `/dashboard/parent` - Dashboard Parent
  6. `/dashboard/enseignant` - Dashboard Enseignant
  7. `/dashboard/admin` - Dashboard Admin
  8. `/courses` - Liste des cours
  9. `/courses/:id` - Détail d'un cours
  10. `/profile` - Profil utilisateur
  11. `/subscriptions` - Abonnements
  12. `/live/:id` - Session live

- ✅ Redux Toolkit pour la gestion d'état
- ✅ React Router pour navigation
- ✅ Tailwind CSS avec support RTL
- ✅ Design responsive et accessible

### Base de données (Cloudflare D1 - SQLite)
- ✅ Table `users` - Utilisateurs avec rôles
- ✅ Table `courses` - Cours par niveau et matière
- ✅ Table `quizzes` - Quizz interactifs en JSON
- ✅ Table `subscriptions` - Gestion des abonnements
- ✅ Table `progress` - Suivi de progression

## 🚀 Installation & Démarrage Local

### Prérequis
- Node.js 18+
- npm/pnpm
- Compte Cloudflare (pour déploiement)

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd webapp

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .dev.vars.example .dev.vars
# Éditer .dev.vars avec vos clés

# Build le projet
npm run build
```

### Démarrage en développement

```bash
# Démarrer le serveur de développement local
npm run dev:server

# Le serveur démarre sur http://localhost:3000
```

### Comptes de test

- **Admin**: admin@ta3limi.tn / admin123
- **Enseignant**: prof@ta3limi.tn / prof123
- **Parent**: parent@ta3limi.tn / parent123
- **Élève**: eleve@ta3limi.tn / eleve123

## 📊 Architecture

### Stack Technologique

**Frontend**:
- React 18.3+ avec TypeScript
- Redux Toolkit pour state management
- React Router v7 pour routing
- Tailwind CSS pour styling
- Axios pour les requêtes HTTP
- Chart.js pour graphiques
- LiveKit React Components

**Backend**:
- Hono framework (léger, rapide)
- Cloudflare Workers (edge computing)
- Cloudflare D1 (SQLite distribué)
- Cloudflare R2 (stockage objet)
- Cloudflare KV (key-value store)

**Sécurité**:
- JWT pour authentification
- Bcrypt pour hachage des mots de passe
- CORS configuré
- Validation des entrées
- Protection XSS

## 🎨 Pages & URLs

| URL | Rôle | Description |
|-----|------|-------------|
| `/` | Public | Page d'accueil |
| `/login` | Public | Connexion |
| `/register` | Public | Inscription |
| `/dashboard/eleve` | Élève | Dashboard élève avec stats |
| `/dashboard/parent` | Parent | Suivi des enfants |
| `/dashboard/enseignant` | Prof | Créer/gérer cours |
| `/dashboard/admin` | Admin | Administration complète |
| `/courses` | Auth | Liste des cours filtrables |
| `/courses/:id` | Auth | Détail cours + quiz |
| `/profile` | Auth | Profil et paramètres |
| `/subscriptions` | Élève | Gestion abonnement |
| `/live/:id` | Auth | Session live interactive |

## 🗄️ Schéma Base de Données

### Table `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('eleve','parent','enseignant','admin')),
  nom TEXT,
  classe TEXT,
  parent_id INTEGER,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table `courses`
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  niveau TEXT CHECK(niveau IN ('primaire','college','lycee')),
  matiere TEXT NOT NULL,
  description TEXT,
  enseignant_id INTEGER,
  video_url TEXT,
  pdf_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table `quizzes`
```sql
CREATE TABLE quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  questions TEXT NOT NULL,  -- JSON
  course_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table `subscriptions`
```sql
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  plan TEXT CHECK(plan IN ('gratuit','premium')),
  status TEXT DEFAULT 'active',
  start_date DATETIME,
  end_date DATETIME
);
```

### Table `progress`
```sql
CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  course_id INTEGER,
  quiz_id INTEGER,
  score INTEGER,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

### Courses
- `GET /api/courses` - Liste des cours (filtres: niveau, matière, search)
- `GET /api/courses/:id` - Détail d'un cours
- `POST /api/courses` - Créer un cours (enseignant/admin)
- `PUT /api/courses/:id` - Modifier un cours
- `DELETE /api/courses/:id` - Supprimer un cours
- `POST /api/courses/upload-pdf` - Upload PDF sur R2

### Quizzes
- `GET /api/quizzes/:id` - Détail quiz
- `GET /api/quizzes/course/:courseId` - Quiz d'un cours
- `POST /api/quizzes` - Créer quiz (enseignant/admin)
- `POST /api/quizzes/:id/submit` - Soumettre réponses

### Progress
- `GET /api/progress` - Progression utilisateur
- `GET /api/progress/stats` - Statistiques
- `GET /api/progress/child/:childId` - Progression enfant (parent)

### Subscriptions
- `GET /api/subscriptions` - Abonnement actuel
- `POST /api/subscriptions/upgrade` - Passer à premium
- `GET /api/subscriptions/check-access/:courseId` - Vérifier accès

### Users
- `GET /api/users/profile` - Profil
- `PUT /api/users/profile` - Modifier profil
- `POST /api/users/upload-photo` - Upload photo de profil
- `GET /api/users/children` - Liste enfants (parent)

### Admin
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/users` - Liste utilisateurs
- `POST /api/admin/users` - Créer utilisateur
- `PUT /api/admin/users/:id` - Modifier utilisateur
- `DELETE /api/admin/users/:id` - Supprimer utilisateur

### Live
- `POST /api/live/token` - Générer token LiveKit
- `POST /api/live/sessions` - Créer session live
- `GET /api/live/sessions` - Liste sessions

## 🔧 Configuration Variables

### .dev.vars (développement local)
```
JWT_SECRET=your-secret-key
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-secret
LIVEKIT_URL=wss://your-livekit-server.railway.app
```

## 🚢 Déploiement

### Cloudflare Pages

```bash
# 1. Créer les ressources Cloudflare
npm run db:create
npm run kv:create
npm run r2:create

# 2. Appliquer migrations
npm run db:migrate:prod

# 3. Déployer
npm run deploy
```

### Variables de production

Configurer dans Cloudflare Dashboard:
- `JWT_SECRET` - Clé secrète JWT
- `LIVEKIT_API_KEY` - Clé API LiveKit
- `LIVEKIT_API_SECRET` - Secret LiveKit
- `LIVEKIT_URL` - URL serveur LiveKit

## 📝 Statut du Projet

### ✅ Complété
- Architecture monorepo
- Backend API complet avec Hono
- Frontend React avec 12 pages
- Authentification JWT
- Base de données D1 avec migrations
- Intégration R2 et KV
- Routes protégées par rôle
- Redux state management
- Design responsive Tailwind

### 🚧 En cours / À améliorer
- Tests unitaires (Vitest)
- Tests e2e
- LiveKit Railway deployment
- Documentation OpenAPI complète
- Déploiement production Cloudflare
- GitHub Actions CI/CD

## 📄 Licence

MIT License - Voir LICENSE file

## 👥 Contact

Pour toute question: contact@ta3limi.tn

---

**Développé avec ❤️ pour l'éducation tunisienne**
