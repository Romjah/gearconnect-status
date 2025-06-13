import React from 'react';
import { AlertCircle, CheckCircle, Clock, ExternalLink, Users, Hash } from 'lucide-react';
import { Incident } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface IncidentsListProps {
  incidents: Incident[];
}

const IncidentsList: React.FC<IncidentsListProps> = ({ incidents }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'major': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'minor': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'investigating': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-800 bg-green-100';
      case 'investigating': return 'text-red-800 bg-red-100';
      case 'identified': return 'text-blue-800 bg-blue-100';
      case 'monitoring': return 'text-yellow-800 bg-yellow-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Incidents</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real incidents and errors from GearConnect mobile app
          </p>
        </div>
        <div className="px-6 py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">No incidents reported in the last 7 days.</p>
          <p className="text-sm text-gray-500 mt-2">GearConnect is running smoothly!</p>
        </div>
      </div>
    );
  }

  // Séparer les incidents actifs et résolus
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Incidents actifs */}
      {activeIncidents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Incidents ({activeIncidents.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Issues currently affecting GearConnect users
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {activeIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} isActive={true} />
            ))}
          </div>
        </div>
      )}

      {/* Incidents résolus */}
      {resolvedIncidents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Resolved Incidents ({resolvedIncidents.slice(0, 10).length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Recently fixed issues from the last 7 days
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {resolvedIncidents.slice(0, 10).map((incident) => (
              <IncidentCard key={incident.id} incident={incident} isActive={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const IncidentCard: React.FC<{ incident: Incident; isActive: boolean }> = ({ incident, isActive }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'major': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'minor': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'investigating': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-800 bg-green-100';
      case 'investigating': return 'text-red-800 bg-red-100';
      case 'identified': return 'text-blue-800 bg-blue-100';
      case 'monitoring': return 'text-yellow-800 bg-yellow-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className={`px-6 py-4 ${isActive ? 'bg-red-50' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon(incident.status)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            <h3 className="text-sm font-medium text-gray-900">
              {incident.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(incident.severity)}`}>
              {incident.severity}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
              {incident.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span>Affected: {incident.affectedServices.join(', ')}</span>
            {incident.count && incident.count > 1 && (
              <span className="flex items-center space-x-1">
                <Hash className="h-3 w-3" />
                <span>{incident.count} occurrences</span>
              </span>
            )}
            {incident.userCount && incident.userCount > 1 && (
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{incident.userCount} users</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
            <span>Started {formatRelativeTime(incident.createdAt)}</span>
            {incident.resolvedAt && (
              <span>Resolved {formatRelativeTime(incident.resolvedAt)}</span>
            )}
            {incident.platform && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {incident.platform}
              </span>
            )}
          </div>

          {incident.updates.length > 0 && (
            <div className="mt-3 text-sm">
              <div className="border-l-2 border-gray-200 pl-3">
                <strong className="text-gray-700">Latest update:</strong>
                <p className="text-gray-600 mt-1">
                  {incident.updates[incident.updates.length - 1].message}
                </p>
              </div>
            </div>
          )}

          {incident.permalink && (
            <div className="mt-3">
              <a
                href={incident.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3" />
                <span>View in Sentry {incident.shortId && `(${incident.shortId})`}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentsList; 