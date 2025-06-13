'use client';

import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, Calendar, ExternalLink } from 'lucide-react';
import StatusOverview from '@/components/status-overview';
import IncidentsList from '@/components/incidents-list';
import UptimeChart from '@/components/uptime-chart';
import NotificationSubscription from '@/components/notification-subscription';
import { StatusPageData } from '@/lib/types';

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Récupérer les données de statut
  const fetchStatusData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/status');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStatusData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching status data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status data');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir manuellement
  const handleRefresh = () => {
    setLoading(true);
    fetchStatusData();
  };

  // Effect pour le chargement initial et le rafraîchissement automatique
  useEffect(() => {
    fetchStatusData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      // Rafraîchir toutes les 30 secondes
      interval = setInterval(fetchStatusData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Gestion du rafraîchissement automatique
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading && !statusData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-600" />
          <p className="text-gray-600">Loading system status...</p>
        </div>
      </div>
    );
  }

  if (error && !statusData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="text-red-600">
            <Calendar className="h-8 w-8 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Unable to Load Status</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-gray-900">
                GearConnect Status
              </div>
              <div className="text-sm text-gray-500">
                Updated {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-refresh toggle */}
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>

              {/* Manual refresh */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                title="Refresh status"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Notifications */}
              <NotificationSubscription />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Status Overview */}
          <StatusOverview
            status={statusData.status}
            metrics={statusData.metrics}
          />

          {/* Uptime Chart */}
          <UptimeChart history={statusData.history} />

          {/* Recent Incidents */}
          <IncidentsList incidents={statusData.incidents} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              <p>© 2024 GearConnect. All rights reserved.</p>
              <p className="mt-1">
                Last system check: {new Date(statusData.lastUpdated).toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="/history"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <Calendar className="h-4 w-4" />
                <span>Status History</span>
              </a>
              
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Powered by Sentry</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 