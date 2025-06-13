import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Incident } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface IncidentsListProps {
  incidents: Incident[];
}

const IncidentsList: React.FC<IncidentsListProps> = ({ incidents }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'major': return 'text-orange-600 bg-orange-100';
      case 'minor': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'investigating': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Incidents</h2>
        </div>
        <div className="px-6 py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">No incidents reported in the last 30 days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Recent Incidents</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {incidents.slice(0, 5).map((incident) => (
          <div key={incident.id} className="px-6 py-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(incident.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {incident.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Affected services: {incident.affectedServices.join(', ')}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    Started {formatRelativeTime(incident.createdAt)}
                  </span>
                  {incident.resolvedAt && (
                    <span>
                      Resolved {formatRelativeTime(incident.resolvedAt)}
                    </span>
                  )}
                </div>
                {incident.updates.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Latest update:</strong> {incident.updates[incident.updates.length - 1].message}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {incidents.length > 5 && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <a href="/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all incidents →
          </a>
        </div>
      )}
    </div>
  );
};

export default IncidentsList; 