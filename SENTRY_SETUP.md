# 🔧 Configuration Sentry - Guide

## 1. Obtenir un Token API Sentry

1. Allez sur [sentry.io](https://sentry.io) 
2. **Settings** → **Developer Settings** → **Auth Tokens**
3. **Create New Token** avec les permissions :
   - ✅ `project:read`
   - ✅ `org:read` 
   - ✅ `project:releases`

## 2. Créer le fichier .env.local

Créez un fichier `.env.local` avec :

```bash
# Sentry Configuration (REQUIRED)
SENTRY_DSN=https://8d1df89964312395a76fc36c4cff9ddc@o4509488456990720.ingest.de.sentry.io/4509488458498128
NEXT_PUBLIC_SENTRY_DSN=https://8d1df89964312395a76fc36c4cff9ddc@o4509488456990720.ingest.de.sentry.io/4509488458498128
SENTRY_ORG=gearconnect
SENTRY_PROJECT=react-native
SENTRY_AUTH_TOKEN=sntrys_VOTRE_TOKEN_ICI

# GearConnect Mobile App (OPTIONAL)
GEARCONNECT_MOBILE_STATUS_URL=http://localhost:8081
GEARCONNECT_API_URL=http://localhost:5000/api

# Debug mode pour voir les données Sentry
SENTRY_DEBUG=true
```

## 3. Ce que Sentry fournit (et ne fournit pas)

### ✅ **Points forts de Sentry :**
- **Incidents réels** : Erreurs et crashs de l'application mobile
- **Taux d'erreur** : Basé sur les incidents non résolus
- **Statut des services** : Analysé depuis les types d'erreurs

### ⚠️ **Limitations de Sentry :**
- **Pas d'uptime réel** : Sentry n'est pas un outil de monitoring d'infrastructure
- **Pas de temps de réponse** : Nécessite des outils APM dédiés
- **Pas de métriques serveur** : Focus sur les erreurs applicatives uniquement

### 🔧 **Pour un monitoring complet, utilisez :**
- **Uptime/Infrastructure** : Pingdom, UptimeRobot, Datadog
- **Performance/APM** : New Relic, Datadog, AppDynamics
- **Erreurs/Incidents** : Sentry ✅ (déjà configuré)

## 4. Interface transparente

- ✅ Messages clairs sur les limitations
- ✅ Focus sur les incidents (force de Sentry)
- ✅ Métriques de performance marquées "N/A"
- ✅ Explications sur les outils recommandés

## 5. Test de la connexion

Une fois configuré, le site utilisera automatiquement les vraies données Sentry au lieu des données mock.

## 6. Vérification

- ✅ Messages : "Using mock data" disparaîtront
- ✅ Vraies métriques depuis votre projet Sentry
- ✅ Incidents réels si il y en a 