'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import UserLoginPage from '@/components/UserLoginPage';

export default function Home() {
  const router = useRouter();
  const { currentUser, loading } = useUser();

  useEffect(() => {
    if (!loading && currentUser) {
      // 로그인되어 있으면 상품 페이지로 이동
      router.replace('/products');
    }
  }, [currentUser, loading, router]);

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl">🥕</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">더미 사용자 로딩중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않았으면 사용자 선택 페이지 표시
  if (!currentUser) {
    return <UserLoginPage />;
  }

  // 로그인되어 있으면 products로 리다이렉트 (useEffect에서 처리)
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <span className="text-3xl">🥕</span>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-300">당근마켓으로 이동중...</p>
      </div>
    </div>
  );
}
