import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight, Smartphone, Code, User, Clock } from 'lucide-react';
import { DetailedError } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface DetailedErrorsProps {
  errors: DetailedError[];
}

const DetailedErrors: React.FC<DetailedErrorsProps> = ({ errors }) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Recent Errors ({errors.length})
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Detailed error information from the last 24 hours for debugging
        </p>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {errors.map((error) => (
          <ErrorCard key={error.id} error={error} />
        ))}
      </div>
    </div>
  );
};

const ErrorCard: React.FC<{ error: DetailedError }> = ({ error }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'fatal': return 'text-red-700 bg-red-100';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'fatal':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="px-6 py-4">
      <div 
        className="flex items-start space-x-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0 mt-1">
          {getLevelIcon(error.level)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {error.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(error.level)}`}>
              {error.level}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(error.timestamp)}</span>
            </span>
            
            {error.user?.email && (
              <span className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{error.user.email}</span>
              </span>
            )}
            
            {error.device?.model && (
              <span className="flex items-center space-x-1">
                <Smartphone className="h-3 w-3" />
                <span>{error.device.model}</span>
              </span>
            )}
          </div>

          <button 
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 ml-8 space-y-4">
          {/* Device & OS Info */}
          {(error.device || error.os || error.app) && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-1">
                <Smartphone className="h-4 w-4" />
                <span>Device Information</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {error.device?.model && (
                  <div><span className="font-medium">Device:</span> {error.device.model}</div>
                )}
                {error.os?.name && error.os?.version && (
                  <div><span className="font-medium">OS:</span> {error.os.name} {error.os.version}</div>
                )}
                {error.app?.version && (
                  <div><span className="font-medium">App Version:</span> {error.app.version}</div>
                )}
                {error.device?.screen_resolution && (
                  <div><span className="font-medium">Screen:</span> {error.device.screen_resolution}</div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {error.tags && error.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {error.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                  >
                    {typeof tag === 'object' ? `${tag.key}: ${tag.value}` : tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stack Trace */}
          {error.stackTrace && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-1">
                <Code className="h-4 w-4" />
                <span>Stack Trace</span>
              </h4>
              <div className="bg-gray-900 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto">
                <pre className="whitespace-pre-wrap">
                  {typeof error.stackTrace === 'string' 
                    ? error.stackTrace 
                    : JSON.stringify(error.stackTrace, null, 2)
                  }
                </pre>
              </div>
            </div>
          )}

          {/* Breadcrumbs */}
          {error.breadcrumbs && error.breadcrumbs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">User Actions Before Error</h4>
              <div className="space-y-1">
                {error.breadcrumbs.slice(-5).map((breadcrumb, index) => (
                  <div 
                    key={index}
                    className="text-xs text-gray-600 border-l-2 border-gray-200 pl-2"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {breadcrumb.category || breadcrumb.type || 'Action'}
                      </span>
                      <span className="text-gray-400">
                        {breadcrumb.timestamp && formatRelativeTime(breadcrumb.timestamp)}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {breadcrumb.message || JSON.stringify(breadcrumb.data || breadcrumb)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailedErrors; 