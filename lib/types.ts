// Types pour le site de statut GearConnect

export interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  responseTime?: number;
  lastChecked: string;
  uptime?: number;
}

export interface SystemStatus {
  overall: ServiceStatus;
  services: {
    [key: string]: ServiceStatus;
  };
  lastUpdated: string;
}

export interface StatusMetrics {
  uptime: {
    percentage: number;
    lastUpdated: string;
  };
  responseTime: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
  };
  errorRate: {
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
  };
}

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  createdAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  timestamp: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  message: string;
}

export interface UptimeEntry {
  date: string;
  uptime: number;
}

export interface ResponseTimeEntry {
  timestamp: string;
  responseTime: number;
}

export interface StatusPageData {
  status: SystemStatus;
  metrics: StatusMetrics;
  incidents: Incident[];
  history: {
    uptime: UptimeEntry[];
    responseTime: ResponseTimeEntry[];
  };
  lastUpdated: string;
}

export interface Subscription {
  id: string;
  email: string;
  phone?: string;
  types: ('incident' | 'maintenance' | 'resolution')[];
  verified: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  webhook: boolean;
  webhookUrl?: string;
}

// Types pour l'intégration Sentry
export interface SentryEvent {
  id: string;
  title: string;
  level: 'error' | 'warning' | 'info';
  timestamp: string;
  tags: Record<string, string>;
  contexts: Record<string, any>;
}

export interface SentryMetrics {
  errorCount: number;
  performanceScore: number;
  userSatisfaction: number;
  apdex: number;
}

// Types pour les configurations
export interface StatusPageConfig {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  refreshInterval: number;
  features: {
    emailNotifications: boolean;
    slackIntegration: boolean;
    discordIntegration: boolean;
  };
}

// Types pour les APIs externes
export interface ExternalStatusAPI {
  name: string;
  url: string;
  headers?: Record<string, string>;
  transform?: (data: any) => ServiceStatus;
}

// Status colors mapping
export const STATUS_COLORS = {
  operational: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    dot: 'bg-green-400',
  },
  degraded: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
  },
  down: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-400',
  },
  maintenance: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-400',
  },
} as const;

// Utility types
export type StatusType = keyof typeof STATUS_COLORS;
export type TrendType = 'up' | 'down' | 'stable';
export type IncidentStatusType = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type SeverityType = 'minor' | 'major' | 'critical'; 