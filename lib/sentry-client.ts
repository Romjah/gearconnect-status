import { Incident, SentryEvent } from './types';

class SentryStatusClient {
  private debug: boolean = false;

  constructor() {
    // Configuration dynamique - lue à chaque utilisation
  }

  // Récupérer la configuration Sentry dynamiquement
  private getConfig() {
    return {
      org: process.env.SENTRY_ORG || 'coding-factory-classrooms',
      project: process.env.SENTRY_PROJECT || 'react-native',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      apiUrl: 'https://sentry.io/api/0',
      debug: process.env.SENTRY_DEBUG === 'true',
    };
  }

  // Vérifier si on doit utiliser les données mock
  private shouldUseMockData(): boolean {
    const config = this.getConfig();
    const useMock = !config.authToken;
    
    if (useMock && config.debug) {
      console.info('🔧 Sentry client: Using mock data (no auth token configured)');
      if (process.env.NODE_ENV === 'development') {
        console.info('💡 To use real Sentry data, add SENTRY_AUTH_TOKEN to your .env.local file');
      }
    } else if (!useMock && config.debug) {
      console.info('🔗 Sentry client: Connected to real Sentry API');
      console.info(`📊 Sentry config: org=${config.org}, project=${config.project}`);
    }
    
    return useMock;
  }

  private async fetchSentryAPI(endpoint: string) {
    const config = this.getConfig();
    
    if (this.shouldUseMockData()) {
      if (config.debug) {
        console.info(`🔄 Mock data requested for: ${endpoint}`);
      }
      return this.getMockData(endpoint);
    }

    if (config.debug) {
      console.info(`🌐 Fetching from Sentry API: ${endpoint}`);
    }

    try {
      const fullUrl = `${config.apiUrl}${endpoint}`;
      if (config.debug) {
        console.info(`🔗 Full URL: ${fullUrl}`);
      }

      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${config.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Sentry API Error ${response.status}: ${response.statusText}`);
        console.error(`📄 Response body: ${errorText}`);
        
        if (response.status === 404) {
          console.error(`🎯 Endpoint not found. Check org (${config.org}) and project (${config.project}) names`);
        } else if (response.status === 401) {
          console.error(`🔐 Authentication failed. Check your SENTRY_AUTH_TOKEN`);
        } else if (response.status === 403) {
          console.error(`🚫 Access forbidden. Check token permissions (need Organization:read and Project:read)`);
        }
        
        throw new Error(`Sentry API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (config.debug) {
        console.info(`✅ Sentry API success: ${Array.isArray(data) ? data.length : Object.keys(data || {}).length} items received`);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`⚠️ Sentry API unavailable (${errorMessage}), falling back to mock data`);
      
      if (config.debug) {
        console.error('Sentry API Error Details:', error);
      }
      
      return this.getMockData(endpoint);
    }
  }

  // Récupérer les incidents actuels avec détails pour debugging
  async getIncidents(): Promise<Incident[]> {
    const config = this.getConfig();
    
    try {
      if (config.debug) {
        console.info('🔍 Fetching real incidents from Sentry...');
      }

      // Récupérer les issues Sentry récentes (résolues et non résolues)
      const issues = await this.fetchSentryAPI(
        `/projects/${config.org}/${config.project}/issues/?statsPeriod=7d&limit=50&sort=date`
      );

      const incidents = this.transformSentryIssuesToIncidents(issues);
      
      if (config.debug) {
        console.info(`📋 Found ${incidents.length} real incidents from last 7 days`);
      }

      return incidents;
    } catch (error) {
      console.error('Error fetching incidents from Sentry:', error);
      return this.getMockIncidents();
    }
  }

  // Calculer le statut réel des services basé uniquement sur les incidents non résolus
  async getServicesStatus(): Promise<any> {
    const config = this.getConfig();
    
    try {
      if (config.debug) {
        console.info('🔧 Calculating real services status from current incidents...');
      }

      const incidents = await this.getIncidents();
      const now = new Date().toISOString();

      // Filtrer seulement les incidents non résolus (problèmes actuels)
      const currentIssues = incidents.filter(i => i.status !== 'resolved');

      // Services de l'application GearConnect
      const services = {
        mobile: { 
          status: 'operational', 
          lastChecked: now,
          issueCount: 0,
          lastIssue: null as string | null
        },
        api: { 
          status: 'operational', 
          lastChecked: now,
          issueCount: 0,
          lastIssue: null as string | null
        },
        auth: { 
          status: 'operational', 
          lastChecked: now,
          issueCount: 0,
          lastIssue: null as string | null
        },
        storage: { 
          status: 'operational', 
          lastChecked: now,
          issueCount: 0,
          lastIssue: null as string | null
        },
      };

      // Analyser chaque incident non résolu
      for (const incident of currentIssues) {
        const affectedServices = this.getAffectedServicesFromIncident(incident);

        for (const serviceName of affectedServices) {
          if (services[serviceName as keyof typeof services]) {
            const service = services[serviceName as keyof typeof services];
            
            // Compter les incidents
            service.issueCount++;
            service.lastIssue = incident.createdAt;
            
            // Mettre à jour le statut selon la sévérité
            if (incident.severity === 'critical') {
              service.status = 'down';
            } else if (incident.severity === 'major' && service.status === 'operational') {
              service.status = 'degraded';
            } else if (incident.severity === 'minor' && service.status === 'operational') {
              service.status = 'degraded';
            }
          }
        }
      }

      // Calculer le statut global
      const overall = this.calculateOverallStatus(services);

      if (config.debug) {
        const affectedServices = Object.keys(services).filter(s => services[s as keyof typeof services].status !== 'operational');
        console.info(`🎯 Real services status: overall=${overall.status}, affected=${affectedServices.join(', ')}, total issues=${currentIssues.length}`);
      }

      return {
        overall,
        services,
        lastUpdated: now,
        totalActiveIssues: currentIssues.length,
      };

    } catch (error) {
      console.error('Error calculating services status from Sentry:', error);
      return this.getMockServicesStatus();
    }
  }

  // Récupérer les détails d'erreurs pour debugging
  async getDetailedErrors(): Promise<any[]> {
    const config = this.getConfig();
    
    try {
      if (config.debug) {
        console.info('🔍 Fetching detailed error information...');
      }

      const events = await this.fetchSentryAPI(
        `/projects/${config.org}/${config.project}/events/?query=&statsPeriod=24h&limit=20`
      );

      if (!Array.isArray(events)) {
        return [];
      }

      const detailedErrors = events.map((event: any) => ({
        id: event.id,
        title: event.title || event.message || 'Unknown error',
        level: event.level || 'error',
        timestamp: event.dateCreated,
        user: event.user || null,
        device: event.contexts?.device || null,
        os: event.contexts?.os || null,
        app: event.contexts?.app || null,
        stackTrace: event.entries?.find((e: any) => e.type === 'exception')?.data || null,
        breadcrumbs: event.entries?.find((e: any) => e.type === 'breadcrumbs')?.data?.values || [],
        tags: event.tags || [],
      }));

      if (config.debug) {
        console.info(`🎯 Found ${detailedErrors.length} detailed errors for debugging`);
      }

      return detailedErrors;
    } catch (error) {
      console.error('Error fetching detailed errors from Sentry:', error);
      return [];
    }
  }

  // Déterminer quels services sont affectés par un incident
  private getAffectedServicesFromIncident(incident: any): string[] {
    const services = new Set<string>();

    const title = incident.title.toLowerCase();
    
    if (title.includes('auth') || title.includes('login')) services.add('Authentication');
    if (title.includes('api') || title.includes('network') || title.includes('fetch')) services.add('API');
    if (title.includes('storage') || title.includes('upload') || title.includes('file')) services.add('Storage');
    if (title.includes('mobile') || title.includes('app') || title.includes('navigation')) services.add('Mobile App');
    
    // Analyser les tags
    if (incident.tags) {
      for (const tag of incident.tags) {
        if (tag.key === 'service' || tag.key === 'component') {
          services.add(tag.value);
        }
      }
    }
    
    // Service par défaut si aucun détecté
    if (services.size === 0) {
      services.add('Mobile App');
    }
    
    return Array.from(services);
  }

  // Calculer le statut global du système
  private calculateOverallStatus(services: any): { status: string; lastChecked: string } {
    const statuses = Object.values(services).map((service: any) => service.status);
    const now = new Date().toISOString();

    if (statuses.includes('down')) {
      return { status: 'down', lastChecked: now };
    } else if (statuses.includes('degraded')) {
      return { status: 'degraded', lastChecked: now };
    } else {
      return { status: 'operational', lastChecked: now };
    }
  }

  // Statut des services mock pour les fallbacks
  private getMockServicesStatus(): any {
    const now = new Date().toISOString();
    
    return {
      overall: {
        status: 'operational',
        lastChecked: now,
      },
      services: {
        mobile: { status: 'operational', lastChecked: now, issueCount: 0, lastIssue: null },
        api: { status: 'operational', lastChecked: now, issueCount: 0, lastIssue: null },
        auth: { status: 'operational', lastChecked: now, issueCount: 0, lastIssue: null },
        storage: { status: 'operational', lastChecked: now, issueCount: 0, lastIssue: null },
      },
      lastUpdated: now,
      totalActiveIssues: 0,
    };
  }

  // Transformer les issues Sentry en incidents avec plus de détails
  private transformSentryIssuesToIncidents(issues: any[]): Incident[] {
    const config = this.getConfig();
    
    if (!Array.isArray(issues)) {
      if (config.debug) {
        console.warn('Issues response is not an array:', typeof issues);
      }
      return this.getMockIncidents();
    }

    return issues
      .map((issue: any) => {
        const level = issue.level || 'error';
        const severity = level === 'fatal' ? 'critical' : level === 'error' ? 'major' : 'minor';
        
        return {
          id: issue.id,
          title: issue.title || issue.culprit || 'Unknown incident',
          status: this.mapSentryStatusToIncidentStatus(issue.status),
          severity: severity as 'minor' | 'major' | 'critical',
          affectedServices: this.extractAffectedServices(issue),
          createdAt: issue.firstSeen,
          resolvedAt: issue.status === 'resolved' ? issue.lastSeen : undefined,
          updates: this.extractIncidentUpdates(issue),
          // Informations supplémentaires pour debugging
          count: issue.count || 0,
          userCount: issue.userCount || 0,
          permalink: issue.permalink,
          shortId: issue.shortId,
          platform: issue.platform,
        };
      })
      .slice(0, 20); // Limiter à 20 incidents récents
  }

  // Extraire les services affectés depuis les tags/contexte
  private extractAffectedServices(issue: any): string[] {
    const services = new Set<string>();
    
    // Analyser le titre et le culprit
    const text = `${issue.title || ''} ${issue.culprit || ''}`.toLowerCase();
    
    if (text.includes('auth') || text.includes('login')) services.add('Authentication');
    if (text.includes('api') || text.includes('network') || text.includes('fetch')) services.add('API');
    if (text.includes('storage') || text.includes('upload') || text.includes('file')) services.add('Storage');
    if (text.includes('mobile') || text.includes('app') || text.includes('navigation')) services.add('Mobile App');
    
    // Analyser les tags
    if (issue.tags) {
      for (const tag of issue.tags) {
        if (tag.key === 'service' || tag.key === 'component') {
          services.add(tag.value);
        }
      }
    }
    
    // Service par défaut si aucun détecté
    if (services.size === 0) {
      services.add('Mobile App');
    }
    
    return Array.from(services);
  }

  // Extraire les mises à jour d'incident
  private extractIncidentUpdates(issue: any): any[] {
    const updates = [];
    
    if (issue.firstSeen) {
      updates.push({
        id: `${issue.id}-first`,
        timestamp: issue.firstSeen,
        status: 'investigating',
        message: `First occurrence detected ${issue.count > 1 ? `(${issue.count} times total)` : ''}`,
      });
    }
    
    if (issue.lastSeen && issue.lastSeen !== issue.firstSeen) {
      updates.push({
        id: `${issue.id}-last`,
        timestamp: issue.lastSeen,
        status: this.mapSentryStatusToIncidentStatus(issue.status),
        message: `Last occurrence ${issue.userCount > 1 ? `affecting ${issue.userCount} users` : ''}`,
      });
    }
    
    return updates;
  }

  // Mapper le statut Sentry au statut d'incident
  private mapSentryStatusToIncidentStatus(sentryStatus: string): 'investigating' | 'identified' | 'monitoring' | 'resolved' {
    switch (sentryStatus) {
      case 'unresolved': return 'investigating';
      case 'ignored': return 'identified';
      case 'resolved': return 'resolved';
      case 'resolving': return 'monitoring';
      default: return 'investigating';
    }
  }

  // Données mock simplifiées pour le développement
  private getMockData(endpoint: string): any {
    if (endpoint.includes('issues')) {
      return this.getMockSentryIssues();
    } else if (endpoint.includes('events')) {
      return this.getMockSentryEvents();
    }
    return [];
  }

  private getMockSentryIssues(): any[] {
    return [
      {
        id: 'mock-issue-1',
        title: 'Network timeout in user authentication',
        status: 'unresolved',
        level: 'error',
        firstSeen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        count: 15,
        userCount: 5,
        platform: 'react-native',
        permalink: 'https://sentry.io/mock-issue-1',
        shortId: 'GEARCONNECT-1',
        tags: [
          { key: 'service', value: 'auth' },
          { key: 'component', value: 'login' },
        ],
      },
    ];
  }

  private getMockSentryEvents(): any[] {
    return [
      {
        id: 'mock-event-1',
        title: 'Network Error: timeout',
        level: 'error',
        dateCreated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        user: { email: 'user@example.com' },
        contexts: {
          device: { model: 'iPhone 12', os: { name: 'iOS', version: '15.0' } },
          app: { version: '1.2.0' }
        },
        tags: [{ key: 'environment', value: 'production' }],
      },
    ];
  }

  private getMockIncidents(): Incident[] {
    return [
      {
        id: 'mock-incident-1',
        title: 'Authentication Service Timeout',
        status: 'investigating',
        severity: 'major',
        affectedServices: ['Authentication', 'Mobile App'],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updates: [
          {
            id: 'update-1',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: 'investigating',
            message: 'First occurrence detected (15 times total)',
          },
        ],
        count: 15,
        userCount: 5,
        platform: 'react-native',
      },
    ];
  }
}

export const sentryClient = new SentryStatusClient(); 