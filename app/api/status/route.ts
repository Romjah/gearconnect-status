import { NextRequest, NextResponse } from 'next/server';
import { sentryClient } from '@/lib/sentry-client';
import { mobileClient } from '@/lib/mobile-client';
import { StatusPageData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les données en parallèle depuis toutes les sources
    const [mobileStatus, sentryIncidents, sentryMetrics, uptimeHistory, responseTimeHistory] = await Promise.allSettled([
      mobileClient.getSystemStatus(),
      sentryClient.getIncidents(),
      sentryClient.getMetrics(),
      mobileClient.getUptimeHistory(30),
      mobileClient.getResponseTimeHistory(24),
    ]);

    // Résoudre les résultats avec des fallbacks
    const status = mobileStatus.status === 'fulfilled' 
      ? mobileStatus.value 
      : {
          overall: { status: 'operational' as const, lastChecked: new Date().toISOString() },
          services: {},
          lastUpdated: new Date().toISOString(),
        };

    const incidents = sentryIncidents.status === 'fulfilled' ? sentryIncidents.value : [];
    const metrics = sentryMetrics.status === 'fulfilled' ? sentryMetrics.value : {
      uptime: { percentage: 99.9, lastUpdated: new Date().toISOString() },
      responseTime: { average: 200, trend: 'stable' as const, lastUpdated: new Date().toISOString() },
      errorRate: { percentage: 0.1, trend: 'stable' as const, lastUpdated: new Date().toISOString() },
    };

    const history = {
      uptime: uptimeHistory.status === 'fulfilled' ? uptimeHistory.value : [],
      responseTime: responseTimeHistory.status === 'fulfilled' ? responseTimeHistory.value : [],
    };

    // Construire la réponse complète
    const statusPageData: StatusPageData = {
      status,
      metrics,
      incidents,
      history,
      lastUpdated: new Date().toISOString(),
    };

    // Headers pour le cache et la performance
    const response = NextResponse.json(statusPageData);
    
    // Cache pendant 30 secondes
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    
    // Headers CORS pour permettre l'accès depuis d'autres domaines
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;

  } catch (error) {
    console.error('Error in status API:', error);
    
    // Retourner des données de fallback en cas d'erreur
    const fallbackData: StatusPageData = {
      status: {
        overall: { 
          status: 'operational', 
          lastChecked: new Date().toISOString() 
        },
        services: {
          api: { 
            status: 'operational', 
            responseTime: 200, 
            lastChecked: new Date().toISOString() 
          },
          database: { 
            status: 'operational', 
            responseTime: 150, 
            lastChecked: new Date().toISOString() 
          },
          storage: { 
            status: 'operational', 
            responseTime: 100, 
            lastChecked: new Date().toISOString() 
          },
          auth: { 
            status: 'operational', 
            responseTime: 80, 
            lastChecked: new Date().toISOString() 
          },
          mobile: { 
            status: 'operational', 
            responseTime: 50, 
            lastChecked: new Date().toISOString() 
          },
        },
        lastUpdated: new Date().toISOString(),
      },
      metrics: {
        uptime: { 
          percentage: 99.9, 
          lastUpdated: new Date().toISOString() 
        },
        responseTime: { 
          average: 200, 
          trend: 'stable', 
          lastUpdated: new Date().toISOString() 
        },
        errorRate: { 
          percentage: 0.1, 
          trend: 'stable', 
          lastUpdated: new Date().toISOString() 
        },
      },
      incidents: [],
      history: {
        uptime: [],
        responseTime: [],
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(fallbackData, { 
      status: 200, // Retourner 200 même en cas d'erreur pour éviter de casser le site
      headers: {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// Gérer les requêtes OPTIONS pour CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 