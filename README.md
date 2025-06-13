# 🚀 GearConnect Status Page

Un site de statut moderne et en temps réel pour l'application mobile GearConnect, alimenté par **Sentry** et construit avec **Next.js 15**, **TypeScript** et **Tailwind CSS**.

![GearConnect Status](https://img.shields.io/badge/Status-Operational-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue)

## ✨ Fonctionnalités

### 🔍 **Monitoring en Temps Réel**
- Statut des services (API, Database, Storage, Auth, Mobile)
- Métriques de performance (Uptime, Response Time, Error Rate)
- Détection automatique d'incidents via Sentry
- Rafraîchissement automatique toutes les 30 secondes

### 📊 **Visualisation des Données**
- Graphiques de uptime sur 90 jours
- Historique des temps de réponse sur 24h
- Indicateurs visuels de statut avec couleurs
- Interface inspirée de [Vercel Status](https://www.vercel-status.com/)

### 🔔 **Notifications**
- Abonnements email pour les incidents
- Notifications automatiques via Sentry
- Désabonnement en un clic
- Support des webhooks (configuration avancée)

### 🔧 **Intégrations**
- **Sentry** pour le monitoring et les incidents
- **App Mobile GearConnect** pour les health checks
- **API REST** pour l'intégration externe
- **Cache intelligent** avec ISR (Incremental Static Regeneration)

## 🏗️ Architecture

```
GearConnect Mobile App ──► Sentry ──► Status Page ──► Users
                                   ▲
                                   │
                              Public API
```

### Sources de Données
1. **Sentry API** - Incidents et métriques de performance
2. **Mobile App** - Health checks et statut des services
3. **Direct Health Checks** - Fallback pour la disponibilité
4. **Cache Local** - Optimisation des performances

## 🚀 Installation

### Prérequis
- **Node.js** 18+ ou **Bun**
- **Sentry Account** (gratuit)
- **GearConnect Mobile App** (optionnel)

### 1. Configuration

Créer le fichier `.env.local` :

```bash
# Sentry Configuration
SENTRY_DSN=https://YOUR_SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_SENTRY_DSN
SENTRY_ORG=coding-factory-classrooms
SENTRY_PROJECT=gearconnect-status
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# GearConnect Mobile App Integration
GEARCONNECT_MOBILE_STATUS_URL=http://localhost:8081/status
GEARCONNECT_API_URL=http://localhost:5000/api

# Email Notifications (Gmail SMTP gratuit)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Site Configuration
SITE_NAME=GearConnect
SITE_URL=https://status.gearconnect.app
CONTACT_EMAIL=support@gearconnect.app

# Refresh Intervals
STATUS_REFRESH_INTERVAL=30000
INCIDENT_REFRESH_INTERVAL=60000

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SLACK_INTEGRATION=false
ENABLE_DISCORD_INTEGRATION=false
```

### 2. Installation des Dépendances

```bash
# Avec Bun (recommandé)
bun install

# Ou avec npm
npm install
```

### 3. Lancement

```bash
# Développement
bun run dev

# Production
bun run build
bun run start
```

Le site sera accessible sur **http://localhost:3000**

## 🔧 Configuration Sentry

### 1. Créer un Projet Sentry

1. Aller sur [sentry.io](https://sentry.io)
2. Créer un nouveau projet **React**
3. Noter le **DSN** fourni

### 2. Générer un Token d'API

1. Aller dans **Settings** > **Account** > **API**
2. Créer un nouveau token avec les permissions :
   - `project:read`
   - `project:releases`
   - `org:read`

### 3. Configurer les Tags

Dans votre app mobile GearConnect, assurez-vous d'utiliser ces tags Sentry :

```typescript
// Tags pour les incidents
Sentry.setTag('incident_type', 'service_outage');
Sentry.setTag('incident_severity', 'minor|major|critical');
Sentry.setTag('affected_services', 'api,database');

// Tags pour le monitoring
Sentry.setTag('health_status', 'healthy|degraded|down');
Sentry.setTag('service_type', 'mobile_app');
```

## 📡 API Endpoints

### Statut Public
```bash
GET /api/status
```

Retourne le statut complet du système :

```json
{
  "status": {
    "overall": { "status": "operational", "lastChecked": "2024-..." },
    "services": {
      "api": { "status": "operational", "responseTime": 200 },
      "database": { "status": "operational", "responseTime": 150 }
    }
  },
  "metrics": {
    "uptime": { "percentage": 99.95 },
    "responseTime": { "average": 185, "trend": "stable" },
    "errorRate": { "percentage": 0.05, "trend": "stable" }
  },
  "incidents": [],
  "history": {
    "uptime": [...],
    "responseTime": [...]
  }
}
```

### Abonnements Email
```bash
# S'abonner
POST /api/subscribe
{
  "email": "user@example.com"
}

# Se désabonner
DELETE /api/subscribe?email=user@example.com

# Liste des abonnés (admin)
GET /api/subscribe
```

## 🎨 Personnalisation

### Couleurs et Thème

Modifier `tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### Messages de Statut

Modifier `components/status-overview.tsx` pour personnaliser les messages.

### Services Monitorés

Ajouter/modifier les services dans `lib/mobile-client.ts` et `lib/types.ts`.

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Configurer les variables d'environnement
vercel env add SENTRY_DSN
vercel env add NEXT_PUBLIC_SENTRY_DSN
# ... autres variables
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables d'Environnement Production

```bash
# Obligatoires
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Optionnelles
SENTRY_AUTH_TOKEN=token_for_api_access
GEARCONNECT_API_URL=https://api.gearconnect.app
SITE_URL=https://status.gearconnect.app
```

## 🔗 Intégration avec GearConnect Mobile

### 1. Endpoint de Statut

Votre app mobile doit exposer `/api/status` :

```typescript
// Exemple d'endpoint dans l'app mobile
app.get('/api/status', async (req, res) => {
  const status = await statusApiService.getPublicStatus();
  res.json(status);
});
```

### 2. Headers CORS

```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://status.gearconnect.app');
  next();
});
```

## 📊 Monitoring et Alertes

### Sentry Alerts

1. **Performance Alerts** - Temps de réponse > 2s
2. **Error Rate Alerts** - Taux d'erreur > 5%
3. **Incident Alerts** - Nouveaux incidents détectés

### Email Notifications

Les utilisateurs abonnés reçoivent des emails pour :
- ✅ Nouveaux incidents
- 🔄 Mises à jour d'incidents
- ✅ Résolution d'incidents
- 🔧 Maintenances programmées

## 🔧 Développement

### Structure du Projet

```
gearconnect-status/
├── app/                    # App Router Next.js 15
│   ├── api/               # API Routes
│   ├── page.tsx           # Page principale
│   └── layout.tsx         # Layout global
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── status-overview.tsx
│   ├── incidents-list.tsx
│   └── uptime-chart.tsx
├── lib/                   # Logique métier
│   ├── types.ts          # Types TypeScript
│   ├── sentry-client.ts  # Client Sentry
│   ├── mobile-client.ts  # Client app mobile
│   └── utils.ts          # Utilitaires
└── data/                 # Données locales
    └── subscriptions.json # Abonnements email
```

### Scripts Disponibles

```bash
# Développement
bun run dev

# Build de production
bun run build

# Tests (TODO)
bun run test

# Linting
bun run lint

# Formatage
bun run format
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Documentation** : [Wiki du projet](https://github.com/your-org/gearconnect-status/wiki)
- **Issues** : [GitHub Issues](https://github.com/your-org/gearconnect-status/issues)
- **Email** : support@gearconnect.app

---

**Fait avec ❤️ pour la communauté GearConnect**
