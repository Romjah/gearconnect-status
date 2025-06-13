import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Edge runtime configuration
  debug: false,
  
  // Tags for identifying status page events
  initialScope: {
    tags: {
      component: "status_page_edge",
      service: "gearconnect",
    },
  },
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Edge-specific configuration
  beforeSend(event) {
    // Don't send events in development unless explicitly configured
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }
    
    return event;
  },
}); 