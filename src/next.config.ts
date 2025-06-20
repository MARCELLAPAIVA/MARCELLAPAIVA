
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true, // Removido para builds de produção
  // },
  // eslint: {
  //   ignoreDuringBuilds: true, // Removido para builds de produção
  // },
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
      'http://9003-firebase-studio-1749839699180.cluster-vpxjqdstfzgs6qeiaf7rdlsqrc.cloudworkstations.dev',
      'https://9003-firebase-studio-1749839699180.cluster-vpxjqdstfzgs6qeiaf7rdlsqrc.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
