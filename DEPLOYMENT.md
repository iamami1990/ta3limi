# Guide de Déploiement Ta3limi

## 📋 Prérequis

1. Compte Cloudflare avec accès à:
   - Cloudflare Pages
   - Cloudflare Workers
   - Cloudflare D1
   - Cloudflare R2
   - Cloudflare KV

2. Compte GitHub pour le code source

3. (Optionnel) Compte Railway pour LiveKit

## 🚀 Déploiement Étape par Étape

### 1. Configuration Cloudflare

#### 1.1 Créer la base de données D1

```bash
npx wrangler d1 create ta3limi-production
```

Copier le `database_id` retourné et l'ajouter dans `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ta3limi-production",
      "database_id": "VOTRE_DATABASE_ID_ICI"
    }
  ]
}
```

#### 1.2 Créer le bucket R2

```bash
npx wrangler r2 bucket create ta3limi-files
```

#### 1.3 Créer le namespace KV

```bash
npx wrangler kv:namespace create auth
npx wrangler kv:namespace create auth --preview
```

Ajouter les IDs dans `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "VOTRE_KV_ID",
      "preview_id": "VOTRE_PREVIEW_KV_ID"
    }
  ]
}
```

### 2. Migrations Base de Données

```bash
# Appliquer les migrations en production
npx wrangler d1 migrations apply ta3limi-production

# Insérer les données de test (optionnel)
npx wrangler d1 execute ta3limi-production --file=./seed.sql
```

### 3. Configuration des Variables d'Environnement

```bash
# JWT Secret
npx wrangler pages secret put JWT_SECRET --project-name ta3limi
# Entrer une clé secrète forte (ex: générer avec openssl rand -hex 32)

# LiveKit API Key (si vous utilisez LiveKit)
npx wrangler pages secret put LIVEKIT_API_KEY --project-name ta3limi

# LiveKit API Secret
npx wrangler pages secret put LIVEKIT_API_SECRET --project-name ta3limi

# LiveKit URL
npx wrangler pages secret put LIVEKIT_URL --project-name ta3limi
```

### 4. Build et Déploiement

```bash
# Build le projet
npm run build

# Créer le projet Cloudflare Pages
npx wrangler pages project create ta3limi --production-branch main

# Déployer
npx wrangler pages deploy dist --project-name ta3limi
```

### 5. Configuration Post-Déploiement

#### 5.1 Domaine Personnalisé (Optionnel)

```bash
npx wrangler pages domain add votredomaine.com --project-name ta3limi
```

#### 5.2 Vérifier le Déploiement

Votre application sera accessible à:
- Production: `https://ta3limi.pages.dev`
- Branch déploiements: `https://[branch].ta3limi.pages.dev`

## 🔧 Configuration LiveKit (Optionnel)

### Déploiement sur Railway

1. Créer un compte sur [Railway.app](https://railway.app)

2. Créer un nouveau projet

3. Déployer LiveKit:
   ```yaml
   # railway.json
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "Dockerfile"
     },
     "deploy": {
       "startCommand": "livekit-server --config config.yaml",
       "healthcheckPath": "/",
       "healthcheckTimeout": 100
     }
   }
   ```

4. Créer `Dockerfile`:
   ```dockerfile
   FROM livekit/livekit-server:latest
   
   COPY config.yaml /config.yaml
   
   EXPOSE 7880 7881 7882
   
   CMD ["livekit-server", "--config", "/config.yaml"]
   ```

5. Créer `config.yaml`:
   ```yaml
   port: 7880
   rtc:
     port_range_start: 50000
     port_range_end: 60000
     use_external_ip: true
   
   keys:
     API_KEY: YOUR_API_KEY
     API_SECRET: YOUR_API_SECRET
   ```

6. Récupérer l'URL du service Railway et la configurer dans Cloudflare Pages

## 🧪 Tests en Production

### Tester l'API

```bash
# Health check
curl https://ta3limi.pages.dev/api/health

# Register (test)
curl -X POST https://ta3limi.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","role":"eleve","nom":"Test User","classe":"4ème primaire"}'

# Login
curl -X POST https://ta3limi.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Tester l'Interface

1. Ouvrir `https://ta3limi.pages.dev`
2. Tester l'inscription avec les rôles différents
3. Tester la connexion avec les comptes de test:
   - admin@ta3limi.tn / admin123
   - prof@ta3limi.tn / prof123
   - eleve@ta3limi.tn / eleve123

## 📊 Monitoring

### Cloudflare Analytics

- Accéder à Cloudflare Dashboard
- Sélectionner votre site Pages
- Voir les métriques:
  - Requêtes
  - Bande passante
  - Erreurs
  - Performance

### Logs

```bash
# Voir les logs en temps réel
npx wrangler pages deployment tail
```

### Base de Données

```bash
# Exécuter des requêtes sur D1
npx wrangler d1 execute ta3limi-production --command="SELECT COUNT(*) FROM users"

# Voir toutes les tables
npx wrangler d1 execute ta3limi-production --command="SELECT name FROM sqlite_master WHERE type='table'"
```

## 🔄 Mise à Jour

```bash
# 1. Pull les dernières modifications
git pull origin main

# 2. Installer les dépendances si nécessaire
npm install

# 3. Build
npm run build

# 4. Déployer
npx wrangler pages deploy dist --project-name ta3limi
```

## 🐛 Dépannage

### Erreur "database not found"

```bash
# Recréer et migrer la base
npx wrangler d1 create ta3limi-production
npx wrangler d1 migrations apply ta3limi-production
```

### Erreur "KV namespace not found"

```bash
# Recréer le namespace KV
npx wrangler kv:namespace create auth
```

### Erreur "Module not found"

```bash
# Nettoyer et rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Problèmes de CORS

Vérifier dans `server/index.ts` que CORS est bien configuré:

```typescript
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))
```

## 📞 Support

Pour toute question ou problème:
- Email: support@ta3limi.tn
- Documentation Cloudflare: https://developers.cloudflare.com/pages/
- GitHub Issues: [repository-url]/issues

## 🔐 Sécurité en Production

### Checklist

- [ ] JWT_SECRET changé (générer une clé forte)
- [ ] HTTPS activé (automatique avec Cloudflare)
- [ ] Rate limiting configuré (via Cloudflare)
- [ ] Backups D1 configurés
- [ ] Monitoring actif
- [ ] Logs activés
- [ ] Variables sensibles en secrets (pas en vars)

### Génération de Secrets Forts

```bash
# JWT Secret (32 bytes)
openssl rand -hex 32

# API Keys
openssl rand -base64 32
```

## 📈 Performance

### Optimisations Recommandées

1. **Cache Cloudflare**:
   - Assets statiques: cache automatique
   - API: configurer Cache-Control headers

2. **R2 Signed URLs**:
   - Implémenter URLs signées avec expiration
   - Éviter l'accès direct aux fichiers

3. **D1 Indexes**:
   - Vérifier que tous les indexes sont en place
   - Ajouter indexes pour queries fréquentes

4. **Workers**:
   - Minimiser les appels externes
   - Utiliser KV pour cache fréquent

## 🎯 Prochaines Étapes

1. Configurer GitHub Actions pour CI/CD automatique
2. Ajouter tests automatisés
3. Implémenter rate limiting
4. Ajouter système de paiement pour premium
5. Configurer CDN pour assets
6. Ajouter système de notifications
7. Implémenter websockets pour chat live
8. Ajouter analytics détaillés

---

**Note**: Ce guide suppose que vous avez déjà configuré votre compte Cloudflare et que vous avez les permissions nécessaires pour créer des ressources.
