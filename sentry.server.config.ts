import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Server-specific configuration
  debug: false,
  
  // Tags for identifying status page events
  initialScope: {
    tags: {
      component: "status_page",
      service: "gearconnect",
    },
  },
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Additional server configuration
  beforeSend(event) {
    // Don't send events in development unless explicitly configured
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }
    
    return event;
  },
}); 