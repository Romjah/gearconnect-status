import { Incident, StatusMetrics, SentryEvent, SentryMetrics } from './types';

// Configuration Sentry pour récupérer les données
const SENTRY_CONFIG = {
  org: process.env.SENTRY_ORG || 'coding-factory-classrooms',
  project: process.env.SENTRY_PROJECT || 'react-native',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  apiUrl: 'https://sentry.io/api/0',
};

class SentryStatusClient {
  private authToken: string;
  private baseUrl: string;

  constructor() {
    this.authToken = SENTRY_CONFIG.authToken || '';
    this.baseUrl = SENTRY_CONFIG.apiUrl;
  }

  private async fetchSentryAPI(endpoint: string) {
    if (!this.authToken) {
      console.warn('Sentry auth token not configured, using mock data');
      return this.getMockData(endpoint);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Sentry API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from Sentry API:', error);
      return this.getMockData(endpoint);
    }
  }

  // Récupérer les incidents depuis Sentry
  async getIncidents(): Promise<Incident[]> {
    try {
      // Récupérer les issues Sentry avec des tags spéciaux pour les incidents
      const issues = await this.fetchSentryAPI(
        `/projects/${SENTRY_CONFIG.org}/${SENTRY_CONFIG.project}/issues/?query=tag:incident_type:service_outage&statsPeriod=30d`
      );

      return this.transformSentryIssuesToIncidents(issues);
    } catch (error) {
      console.error('Error fetching incidents from Sentry:', error);
      return this.getMockIncidents();
    }
  }

  // Récupérer les métriques de performance depuis Sentry
  async getMetrics(): Promise<StatusMetrics> {
    try {
      // Récupérer les métriques de performance
      const [errorStats, performanceStats] = await Promise.all([
        this.fetchSentryAPI(
          `/projects/${SENTRY_CONFIG.org}/${SENTRY_CONFIG.project}/stats/?stat=received&since=${Date.now() - 24 * 60 * 60 * 1000}&until=${Date.now()}&resolution=1h`
        ),
        this.fetchSentryAPI(
          `/projects/${SENTRY_CONFIG.org}/${SENTRY_CONFIG.project}/events/?query=transaction.duration:>0&statsPeriod=24h`
        ),
      ]);

      return this.transformSentryStatsToMetrics(errorStats, performanceStats);
    } catch (error) {
      console.error('Error fetching metrics from Sentry:', error);
      return this.getMockMetrics();
    }
  }

  // Récupérer les événements récents avec tags de santé système
  async getHealthEvents(): Promise<SentryEvent[]> {
    try {
      const events = await this.fetchSentryAPI(
        `/projects/${SENTRY_CONFIG.org}/${SENTRY_CONFIG.project}/events/?query=tag:health_status&statsPeriod=1d&limit=50`
      );

      return events.map((event: any) => ({
        id: event.id,
        title: event.title || event.message,
        level: event.level,
        timestamp: event.dateCreated,
        tags: event.tags,
        contexts: event.contexts || {},
      }));
    } catch (error) {
      console.error('Error fetching health events from Sentry:', error);
      return [];
    }
  }

  // Transformer les issues Sentry en incidents
  private transformSentryIssuesToIncidents(issues: any[]): Incident[] {
    if (!Array.isArray(issues)) return this.getMockIncidents();

    return issues
      .filter(issue => issue.tags?.some((tag: any) => tag.key === 'incident_type'))
      .map((issue: any) => {
        const severityTag = issue.tags?.find((tag: any) => tag.key === 'incident_severity');
        const affectedServicesTag = issue.tags?.find((tag: any) => tag.key === 'affected_services');
        
        return {
          id: issue.id,
          title: issue.title || issue.culprit || 'Unknown incident',
          status: this.mapSentryStatusToIncidentStatus(issue.status),
          severity: severityTag?.value || 'minor',
          affectedServices: affectedServicesTag?.value?.split(',') || ['unknown'],
          createdAt: issue.firstSeen,
          resolvedAt: issue.status === 'resolved' ? issue.lastSeen : undefined,
          updates: this.extractIncidentUpdates(issue),
        };
      })
      .slice(0, 10); // Limiter à 10 incidents récents
  }

  // Transformer les stats Sentry en métriques
  private transformSentryStatsToMetrics(errorStats: any, performanceStats: any): StatusMetrics {
    const now = new Date().toISOString();
    
    // Calculer le taux d'erreur
    const totalEvents = errorStats?.reduce((sum: number, stat: any) => sum + (stat[1] || 0), 0) || 0;
    const errorRate = Math.min(totalEvents / 1000 * 100, 5); // Limiter à 5% max pour la simulation

    // Calculer le temps de réponse moyen
    const avgResponseTime = performanceStats?.length > 0 
      ? performanceStats.reduce((sum: number, event: any) => 
          sum + (event['transaction.duration'] || 200), 0
        ) / performanceStats.length 
      : 200;

    // Calculer l'uptime basé sur les erreurs
    const uptime = Math.max(95, 100 - errorRate);

    return {
      uptime: {
        percentage: Math.round(uptime * 100) / 100,
        lastUpdated: now,
      },
      responseTime: {
        average: Math.round(avgResponseTime),
        trend: avgResponseTime > 1000 ? 'up' : avgResponseTime < 200 ? 'down' : 'stable',
        lastUpdated: now,
      },
      errorRate: {
        percentage: Math.round(errorRate * 100) / 100,
        trend: errorRate > 2 ? 'up' : errorRate < 0.5 ? 'down' : 'stable',
        lastUpdated: now,
      },
    };
  }

  // Extraire les mises à jour d'incident
  private extractIncidentUpdates(issue: any): any[] {
    // Pour une implémentation complète, on pourrait récupérer l'historique des activités
    return [
      {
        id: `${issue.id}-update-1`,
        timestamp: issue.lastSeen,
        status: this.mapSentryStatusToIncidentStatus(issue.status),
        message: `Incident ${issue.status}. Last seen: ${new Date(issue.lastSeen).toLocaleString()}`,
      },
    ];
  }

  // Mapper le statut Sentry au statut d'incident
  private mapSentryStatusToIncidentStatus(sentryStatus: string): 'investigating' | 'identified' | 'monitoring' | 'resolved' {
    switch (sentryStatus) {
      case 'unresolved': return 'investigating';
      case 'ignored': return 'identified';
      case 'resolved': return 'resolved';
      default: return 'monitoring';
    }
  }

  // Données mock pour le développement et les fallbacks
  private getMockData(endpoint: string): any {
    if (endpoint.includes('issues')) {
      return this.getMockSentryIssues();
    } else if (endpoint.includes('stats')) {
      return this.getMockSentryStats();
    } else if (endpoint.includes('events')) {
      return this.getMockSentryEvents();
    }
    return [];
  }

  private getMockSentryIssues(): any[] {
    return [
      {
        id: 'sentry-issue-1',
        title: 'API Response Time Degraded',
        status: 'resolved',
        firstSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        tags: [
          { key: 'incident_type', value: 'service_outage' },
          { key: 'incident_severity', value: 'minor' },
          { key: 'affected_services', value: 'api' },
        ],
      },
    ];
  }

  private getMockSentryStats(): any[] {
    return Array.from({ length: 24 }, (_, i) => [
      Date.now() - (23 - i) * 60 * 60 * 1000,
      Math.floor(Math.random() * 10),
    ]);
  }

  private getMockSentryEvents(): any[] {
    return [
      {
        id: 'event-1',
        title: 'System health check completed',
        level: 'info',
        dateCreated: new Date().toISOString(),
        tags: [{ key: 'health_status', value: 'healthy' }],
        contexts: {},
      },
    ];
  }

  private getMockIncidents(): Incident[] {
    return [
      {
        id: 'mock-incident-1',
        title: 'API Response Time Increased',
        status: 'resolved',
        severity: 'minor',
        affectedServices: ['api'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        updates: [
          {
            id: 'update-1',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: 'resolved',
            message: 'API response times have returned to normal. Monitoring continues.',
          },
        ],
      },
    ];
  }

  private getMockMetrics(): StatusMetrics {
    const now = new Date().toISOString();
    return {
      uptime: {
        percentage: 99.95,
        lastUpdated: now,
      },
      responseTime: {
        average: 185,
        trend: 'stable',
        lastUpdated: now,
      },
      errorRate: {
        percentage: 0.05,
        trend: 'stable',
        lastUpdated: now,
      },
    };
  }
}

export const sentryClient = new SentryStatusClient(); 