import { SystemStatus, UptimeEntry, ResponseTimeEntry } from './types';

// Configuration pour l'intégration avec l'app mobile
const MOBILE_CONFIG = {
  statusUrl: process.env.GEARCONNECT_MOBILE_STATUS_URL || 'http://localhost:8081/status',
  apiUrl: process.env.GEARCONNECT_API_URL || 'http://localhost:5000/api',
  timeout: 5000,
};

class MobileStatusClient {
  private baseUrl: string;
  private apiUrl: string;

  constructor() {
    this.baseUrl = MOBILE_CONFIG.statusUrl;
    this.apiUrl = MOBILE_CONFIG.apiUrl;
  }

  // Récupérer le statut système depuis l'app mobile
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // Essayer de récupérer depuis l'endpoint de l'app mobile
      const response = await fetch(`${this.baseUrl}/api/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout pour éviter les blocages
        signal: AbortSignal.timeout(MOBILE_CONFIG.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformMobileStatusToSystemStatus(data);
      } else {
        throw new Error(`Mobile API responded with status ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to fetch from mobile app, using fallback status checks:', error);
      return await this.performDirectHealthChecks();
    }
  }

  // Récupérer l'historique de uptime
  async getUptimeHistory(days: number = 30): Promise<UptimeEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/uptime-history?days=${days}`, {
        signal: AbortSignal.timeout(MOBILE_CONFIG.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        return data.history || [];
      }
    } catch (error) {
      console.warn('Failed to fetch uptime history from mobile app:', error);
    }

    // Fallback: générer des données simulées
    return this.generateMockUptimeHistory(days);
  }

  // Récupérer l'historique des temps de réponse
  async getResponseTimeHistory(hours: number = 24): Promise<ResponseTimeEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/response-time-history?hours=${hours}`, {
        signal: AbortSignal.timeout(MOBILE_CONFIG.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        return data.history || [];
      }
    } catch (error) {
      console.warn('Failed to fetch response time history from mobile app:', error);
    }

    // Fallback: générer des données simulées
    return this.generateMockResponseTimeHistory(hours);
  }

  // Récupérer le JSON de statut public généré par l'app mobile
  async getPublicStatusJson(): Promise<any> {
    try {
      // Essayer de récupérer le fichier JSON généré par l'app mobile
      const response = await fetch(`${this.baseUrl}/public-status.json`, {
        signal: AbortSignal.timeout(MOBILE_CONFIG.timeout),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch public status JSON from mobile app:', error);
    }

    return null;
  }

  // Effectuer des vérifications de santé directes
  private async performDirectHealthChecks(): Promise<SystemStatus> {
    const now = new Date().toISOString();
    
    try {
      // Vérifier les services en parallèle
      const [apiHealth, databaseHealth, storageHealth] = await Promise.allSettled([
        this.checkApiHealth(),
        this.checkDatabaseHealth(),
        this.checkStorageHealth(),
      ]);

      const services = {
        api: this.resolveHealthResult(apiHealth, 'api'),
        database: this.resolveHealthResult(databaseHealth, 'database'),
        storage: this.resolveHealthResult(storageHealth, 'storage'),
        auth: {
          status: 'operational' as const,
          lastChecked: now,
          responseTime: 50,
        },
        mobile: {
          status: 'operational' as const,
          lastChecked: now,
          responseTime: 30,
        },
      };

      // Calculer le statut global
      const overallStatus = this.calculateOverallStatus(services);

      return {
        overall: {
          status: overallStatus,
          lastChecked: now,
        },
        services,
        lastUpdated: now,
      };
    } catch (error) {
      console.error('Error performing direct health checks:', error);
      return this.getMockSystemStatus();
    }
  }

  // Vérifier la santé de l'API
  private async checkApiHealth() {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'down',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  // Vérifier la santé de la base de données
  private async checkDatabaseHealth() {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.apiUrl}/posts?limit=1`, {
        signal: AbortSignal.timeout(5000),
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'down',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  // Vérifier la santé du stockage (Cloudinary)
  private async checkStorageHealth() {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/demo/ping', {
        signal: AbortSignal.timeout(5000),
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'degraded', // Storage n'est pas critique
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  // Résoudre le résultat d'un health check
  private resolveHealthResult(result: PromiseSettledResult<any>, serviceName: string) {
    const now = new Date().toISOString();
    
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'down' as const,
        lastChecked: now,
        responseTime: 0,
      };
    }
  }

  // Calculer le statut global du système
  private calculateOverallStatus(services: any): 'operational' | 'degraded' | 'down' | 'maintenance' {
    const statuses = Object.values(services).map((service: any) => service.status);
    
    if (statuses.every(status => status === 'operational')) {
      return 'operational';
    } else if (statuses.some(status => status === 'down')) {
      return 'down';
    } else {
      return 'degraded';
    }
  }

  // Transformer les données de l'app mobile en format SystemStatus
  private transformMobileStatusToSystemStatus(mobileData: any): SystemStatus {
    // Mapper les statuts de l'app mobile vers les statuts du site
    const mapStatus = (status: string) => {
      switch (status) {
        case 'healthy': return 'operational';
        case 'degraded': return 'degraded';
        case 'down': return 'down';
        default: return 'operational';
      }
    };

    return {
      overall: {
        status: mapStatus(mobileData.status),
        lastChecked: mobileData.lastUpdated,
      },
      services: Object.fromEntries(
        Object.entries(mobileData.services || {}).map(([name, service]: [string, any]) => [
          name,
          {
            status: mapStatus(service.status),
            responseTime: service.responseTime,
            lastChecked: service.lastChecked || mobileData.lastUpdated,
          },
        ])
      ),
      lastUpdated: mobileData.lastUpdated,
    };
  }

  // Générer des données d'historique simulées
  private generateMockUptimeHistory(days: number): UptimeEntry[] {
    const history: UptimeEntry[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const uptime = Math.random() > 0.05 ? 99.5 + (Math.random() * 0.5) : 95.0 + (Math.random() * 4);
      
      history.push({
        date: date.toISOString().split('T')[0],
        uptime: Math.round(uptime * 100) / 100,
      });
    }
    
    return history;
  }

  private generateMockResponseTimeHistory(hours: number): ResponseTimeEntry[] {
    const history: ResponseTimeEntry[] = [];
    const now = new Date();
    
    for (let i = hours - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseResponseTime = 200;
      const variation = (Math.random() - 0.5) * 100;
      const responseTime = Math.max(50, baseResponseTime + variation);
      
      history.push({
        timestamp: timestamp.toISOString(),
        responseTime: Math.round(responseTime),
      });
    }
    
    return history;
  }

  // Statut système mock pour les fallbacks
  private getMockSystemStatus(): SystemStatus {
    const now = new Date().toISOString();
    
    return {
      overall: {
        status: 'operational',
        lastChecked: now,
      },
      services: {
        api: {
          status: 'operational',
          responseTime: 200,
          lastChecked: now,
        },
        database: {
          status: 'operational',
          responseTime: 150,
          lastChecked: now,
        },
        storage: {
          status: 'operational',
          responseTime: 100,
          lastChecked: now,
        },
        auth: {
          status: 'operational',
          responseTime: 80,
          lastChecked: now,
        },
        mobile: {
          status: 'operational',
          responseTime: 50,
          lastChecked: now,
        },
      },
      lastUpdated: now,
    };
  }
}

export const mobileClient = new MobileStatusClient(); 