// Types pour le site de statut GearConnect - Version simplifiée

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

// Interface principale pour la page de statut (nouvelle version simplifiée)
export interface StatusPageData {
  status: SystemStatus;
  incidents: Incident[];
  detailedErrors: DetailedError[];
  lastUpdated: string;
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