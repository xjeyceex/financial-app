declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean | (() => boolean);
    scope?: string;
    sw?: string;
    runtimeCaching?: unknown[];
    buildExcludes?: RegExp[];
    fallbacks?: { [key: string]: string };
    cacheStartUrl?: boolean;
    reloadOnOnline?: boolean;
    mode?: 'production' | 'development';
    [key: string]: unknown;
  }

  function withPWA(options: PWAOptions): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
