import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UptimeEntry, ResponseTimeEntry } from '@/lib/types';

interface UptimeChartProps {
  history: {
    uptime: UptimeEntry[];
    responseTime: ResponseTimeEntry[];
  };
}

const UptimeChart: React.FC<UptimeChartProps> = ({ history }) => {
  if (history.uptime.length === 0 && history.responseTime.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Performance History</h2>
        </div>
        <div className="px-6 py-8 text-center text-gray-500">
          <p>No historical data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">90-Day Uptime History</h2>
        <p className="text-sm text-gray-600 mt-1">
          Showing uptime percentage over the last 90 days
        </p>
      </div>
      
      {history.uptime.length > 0 && (
        <div className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.uptime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  domain={[95, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: any) => [`${value.toFixed(2)}%`, 'Uptime']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                />
                <Line 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {history.responseTime.length > 0 && (
        <>
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">24-Hour Response Time</h3>
            <p className="text-sm text-gray-600 mt-1">
              Average response time over the last 24 hours
            </p>
          </div>
          <div className="p-6 pt-2">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.responseTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: 'numeric' })}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any) => [`${value}ms`, 'Response Time']}
                    labelFormatter={(label) => new Date(label).toLocaleString('en-US')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UptimeChart; 