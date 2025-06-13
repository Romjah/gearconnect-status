// Types pour le site de statut GearConnect

export interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  lastChecked: string;
  issueCount: number;
  lastIssue: string | null;
}

export interface SystemStatus {
  overall: {
    status: 'operational' | 'degraded' | 'down';
    lastChecked: string;
  };
  services: {
    mobile: ServiceStatus;
    api: ServiceStatus;
    auth: ServiceStatus;
    storage: ServiceStatus;
  };
  lastUpdated: string;
  totalActiveIssues: number;
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
  
  // Informations supplémentaires pour debugging
  count?: number;
  userCount?: number;
  permalink?: string;
  shortId?: string;
  platform?: string;
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
  detailedErrors: DetailedError[];
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
export interface DetailedError {
  id: string;
  title: string;
  level: 'error' | 'warning' | 'info' | 'fatal';
  timestamp: string;
  user?: any;
  device?: any;
  os?: any;
  app?: any;
  stackTrace?: any;
  breadcrumbs?: any[];
  tags?: any[];
}

export interface SentryEvent {
  id: string;
  title: string;
  level: string;
  timestamp: string;
  tags: any[];
  contexts: any;
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

// Configuration des couleurs pour les statuts
export const statusConfig = {
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
} as const;

export type StatusType = keyof typeof statusConfig;
export type TrendType = 'up' | 'down' | 'stable';
export type IncidentStatusType = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type SeverityType = 'minor' | 'major' | 'critical'; 