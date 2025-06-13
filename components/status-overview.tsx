import React from 'react';
import { Activity, Clock, AlertTriangle } from 'lucide-react';
import { SystemStatus, StatusMetrics } from '@/lib/types';
import StatusIndicator from './ui/status-indicator';
import { formatResponseTime, formatUptime, formatRelativeTime } from '@/lib/utils';

interface StatusOverviewProps {
  status: SystemStatus;
  metrics: StatusMetrics;
}

const StatusOverview: React.FC<StatusOverviewProps> = ({ status, metrics }) => {
  const getOverallMessage = () => {
    switch (status.overall.status) {
      case 'operational':
        return 'All systems are operating normally.';
      case 'degraded':
        return 'We are experiencing some performance issues.';
      case 'down':
        return 'We are experiencing major service issues.';
      case 'maintenance':
        return 'We are currently performing scheduled maintenance.';
      default:
        return 'System status is unknown.';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'down':
        return <Activity className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Overall Status */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">GearConnect Status</h1>
        <div className="flex justify-center">
          <StatusIndicator status={status.overall.status} size="lg" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {getOverallMessage()}
        </p>
        <p className="text-sm text-gray-500">
          Last updated {formatRelativeTime(status.lastUpdated)}
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatUptime(metrics.uptime.percentage)}
              </p>
            </div>
            <div className="flex items-center">
              {getTrendIcon('stable')}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last 30 days
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatResponseTime(metrics.responseTime.average)}
              </p>
            </div>
            <div className="flex items-center">
              {getTrendIcon(metrics.responseTime.trend)}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Average over 24h
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatUptime(metrics.errorRate.percentage)}
              </p>
            </div>
            <div className="flex items-center">
              {getTrendIcon(metrics.errorRate.trend)}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last 24 hours
          </p>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Services</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(status.services).map(([serviceName, service]) => (
            <div key={serviceName} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <StatusIndicator 
                    status={service.status} 
                    size="sm" 
                    showText={false} 
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 capitalize">
                    {serviceName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {service.responseTime && (
                      <>Response time: {formatResponseTime(service.responseTime)}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIndicator 
                  status={service.status} 
                  size="sm" 
                  showIcon={false} 
                />
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(service.lastChecked)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusOverview; 