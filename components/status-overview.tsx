import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SystemStatus } from '@/lib/types';
import StatusIndicator from './ui/status-indicator';
import { formatRelativeTime } from '@/lib/utils';

interface StatusOverviewProps {
  status: SystemStatus;
}

const StatusOverview: React.FC<StatusOverviewProps> = ({ status }) => {
  const getOverallMessage = () => {
    const { totalActiveIssues } = status;
    
    if (totalActiveIssues === 0) {
      return 'No active incidents detected in GearConnect.';
    } else if (totalActiveIssues === 1) {
      return '1 active incident affecting GearConnect services.';
    } else {
      return `${totalActiveIssues} active incidents affecting GearConnect services.`;
    }
  };

  const getStatusIcon = (serviceStatus: string, issueCount: number) => {
    if (serviceStatus === 'down') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    } else if (serviceStatus === 'degraded') {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getServiceDisplayName = (serviceName: string) => {
    const names = {
      mobile: 'Mobile App',
      api: 'API Services', 
      auth: 'Authentication',
      storage: 'File Storage'
    };
    return names[serviceName as keyof typeof names] || serviceName;
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

      {/* Active Issues Summary */}
      {status.totalActiveIssues > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-900">
                {status.totalActiveIssues} Active Issue{status.totalActiveIssues !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700">
                Some GearConnect services are experiencing problems. Check the incidents below for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Services Status */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Service Components</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time status based on actual incidents from Sentry
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(status.services).map(([serviceName, service]) => (
            <div key={serviceName} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getStatusIcon(service.status, service.issueCount)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {getServiceDisplayName(serviceName)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {service.issueCount > 0 ? (
                      <>
                        {service.issueCount} active issue{service.issueCount !== 1 ? 's' : ''}
                        {service.lastIssue && (
                          <> • Last: {formatRelativeTime(service.lastIssue)}</>
                        )}
                      </>
                    ) : (
                      'No active issues'
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusOverview; 