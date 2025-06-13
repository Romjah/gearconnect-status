const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour le site de statut
  experimental: {
    // Activer App Router
    appDir: true,
  },
  
  // Configuration des images
  images: {
    domains: ['res.cloudinary.com'],
  },
  
  // Configuration pour la performance
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuration de l'ISR pour le cache des données de statut
  async generateStaticParams() {
    return [];
  },
  
  // Redirections pour SEO
  async redirects() {
    return [
      {
        source: '/status',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  // Sentry configuration for status page
  org: "coding-factory-classrooms",
  project: "gearconnect-status",
  silent: true,
  
  // Upload source maps only in production
  ...(process.env.NODE_ENV === 'production' && {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }),
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions); 