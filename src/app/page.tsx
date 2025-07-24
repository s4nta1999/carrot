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

  // 에러 처리: 로딩이 오래 걸리면 로그인 화면 표시
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('로딩 타임아웃 - 로그인 화면 표시');
      }
    }, 3000); // 3초 후 타임아웃

    return () => clearTimeout(timeout);
  }, [loading]);

  // 로딩 중이거나 사용자 정보가 없으면 바로 로그인 화면 표시
  if (loading || !user) {
    return <AuthPage />;
  }

  // 사용자가 로그인되어 있지 않으면 로그인 페이지 표시
  if (!user) {
    return <AuthPage />;
  }

  // 사용자가 로그인되어 있으면 상품 페이지로 리다이렉트
  // (useEffect에서 처리되지만, 안전장치)
  return null;
}
