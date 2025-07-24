'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/AuthPage';

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩이 완료되고 사용자가 로그인되어 있으면
    if (!loading && user) {
      // 위치 설정을 하지 않은 사용자는 위치 설정 페이지로
      if (profile && !profile.is_location_set) {
        router.push('/location-setup');
      } else {
        // 위치 설정이 완료된 사용자는 products 페이지로
        router.push('/products');
      }
    }
  }, [user, profile, loading, router]);

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <span className="text-3xl font-bold text-white">🥕</span>
          </div>
          <p className="text-white text-lg">당근마켓 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 사용자가 로그인되어 있지 않으면 로그인 페이지 표시
  if (!user) {
    return <AuthPage />;
  }

  // 사용자가 로그인되어 있으면 상품 페이지로 리다이렉트
  // (useEffect에서 처리되지만, 안전장치)
  return null;
}
