import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rqhuwvwtvfabikuoirjf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // 이미지 최적화 설정
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일 캐시
  },
  
  // 성능 최적화
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'leaflet'],
  },
  
  // 압축 설정
  compress: true,
  
  // 보안 헤더
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

export default nextConfig;
