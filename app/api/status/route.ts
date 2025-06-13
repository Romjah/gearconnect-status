import { NextRequest, NextResponse } from 'next/server';
import { sentryClient } from '@/lib/sentry-client';
import { StatusPageData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les données concrètes depuis Sentry pour le debugging
    const [servicesStatus, incidents, detailedErrors] = await Promise.allSettled([
      sentryClient.getServicesStatus(),
      sentryClient.getIncidents(),
      sentryClient.getDetailedErrors(),
    ]);

    // Résoudre les résultats avec des fallbacks
    const status = servicesStatus.status === 'fulfilled' 
      ? servicesStatus.value 
      : {
          overall: { status: 'operational' as const, lastChecked: new Date().toISOString() },
          services: {
            mobile: { status: 'operational', lastChecked: new Date().toISOString(), issueCount: 0, lastIssue: null },
            api: { status: 'operational', lastChecked: new Date().toISOString(), issueCount: 0, lastIssue: null },
            auth: { status: 'operational', lastChecked: new Date().toISOString(), issueCount: 0, lastIssue: null },
            storage: { status: 'operational', lastChecked: new Date().toISOString(), issueCount: 0, lastIssue: null },
          },
          lastUpdated: new Date().toISOString(),
          totalActiveIssues: 0,
        };

    const incidentsData = incidents.status === 'fulfilled' ? incidents.value : [];
    const errorsData = detailedErrors.status === 'fulfilled' ? detailedErrors.value : [];

    // Construire la réponse simplifiée et utile
    const statusPageData: StatusPageData = {
      status,
      incidents: incidentsData,
      detailedErrors: errorsData,
      lastUpdated: new Date().toISOString(),
    };

    // Headers pour le cache et la performance
    const response = NextResponse.json(statusPageData);
    
    // Cache pendant 15 secondes (plus court pour avoir des données récentes)
    response.headers.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    
    // Headers CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;

  } catch (error) {
    console.error('Error in status API:', error);
    
    // Retourner des données de fallback minimales
    const fallbackData: StatusPageData = {
      status: {
        overall: { 
          status: 'operational', 
          lastChecked: new Date().toISOString() 
        },
        services: {
          mobile: { 
            status: 'operational', 
            lastChecked: new Date().toISOString(),
            issueCount: 0,
            lastIssue: null
          },
          api: { 
            status: 'operational', 
            lastChecked: new Date().toISOString(),
            issueCount: 0,
            lastIssue: null
          },
          auth: { 
            status: 'operational', 
            lastChecked: new Date().toISOString(),
            issueCount: 0,
            lastIssue: null
          },
          storage: { 
            status: 'operational', 
            lastChecked: new Date().toISOString(),
            issueCount: 0,
            lastIssue: null
          },
        },
        lastUpdated: new Date().toISOString(),
        totalActiveIssues: 0,
      },
      incidents: [],
      detailedErrors: [],
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(fallbackData, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=5, stale-while-revalidate=15',
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