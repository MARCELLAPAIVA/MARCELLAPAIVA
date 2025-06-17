
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    allowedDevOrigins: [
      'https://9003-firebase-studio-1749839699180.cluster-vpxjqdstfzgs6qeiaf7rdlsqrc.cloudworkstations.dev',
      // You might need to add other variations if the port or subdomain changes,
      // or if you access it via other proxied URLs.
      // For example, if you sometimes access it via http:
      'http://9003-firebase-studio-1749839699180.cluster-vpxjqdstfzgs6qeiaf7rdlsqrc.cloudworkstations.dev'
    ],
  },
};

export default nextConfig;
