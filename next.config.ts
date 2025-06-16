import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const runtimeCaching = [
  // HTML and API routes - Prefer network, fallback to cache
  {
    urlPattern: /^https:\/\/.*$/, // Only cache HTTPS pages for safety
    handler: 'NetworkFirst',
    options: {
      cacheName: 'pages-cache',
      networkTimeoutSeconds: 10,
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },

  // JavaScript and CSS - Prefer cache, revalidate in background
  {
    urlPattern: /\.(?:js|css)$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'assets-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },

  // Fonts - Cache-first because fonts rarely change
  {
    urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'fonts-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      },
    },
  },

  // Images and icons - Cache-first for speed
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'image-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  experimental: {},
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
