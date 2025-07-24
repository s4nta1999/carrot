'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const supabase = createClient();

  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 내 상품 가져오기
  const fetchMyProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, image_url, status, likes_count, views_count, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('내 상품 가져오기 실패:', error);
        return;
      }

      setMyProducts(data || []);
    } catch (error) {
      console.error('내 상품 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리
  const handleSignOut = async () => {
    const confirmLogout = confirm('정말 로그아웃하시겠습니까?');
    if (!confirmLogout) return;

    setIsSigningOut(true);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
        console.error('로그아웃 오류:', error);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('로그아웃 처리 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [user]);

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <MobileLayout title="나의 당근">
      <div className="bg-gray-900 min-h-full">
        {/* 프로필 헤더 */}
        <div className="bg-gray-800 p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || '사용자'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                {profile?.username || user.email?.split('@')[0] || '사용자'}
              </h2>
              <p className="text-gray-400 text-sm mb-1">
                📍 {profile?.district || profile?.location || '위치 미설정'}
              </p>
              <p className="text-orange-500 text-sm">
                🌡️ {profile?.temperature || 36.5}°C
              </p>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-center py-3 px-4 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <span className="text-xl mr-3">🚪</span>
            <span className="text-white">
              {isSigningOut ? '로그아웃 중...' : '로그아웃'}
            </span>
            {isSigningOut && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
            )}
          </button>
        </div>

        {/* 내 상품 목록 */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">내 상품 ({myProducts.length})</h3>
            <Link
              href="/create"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              상품 등록
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : myProducts.length > 0 ? (
            <div className="space-y-4">
              {myProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={product.image_url || '/images/placeholder.svg'}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate mb-1">{product.title}</h4>
                    <p className="text-orange-500 font-bold text-sm mb-1">
                      {product.price.toLocaleString()}원
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>❤️ {product.likes_count || 0}</span>
                      <span>👁️ {product.views_count || 0}</span>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-white mb-2">
                등록된 상품이 없습니다
              </h3>
              <p className="text-gray-400 mb-6">
                첫 번째 상품을 등록해보세요!
              </p>
              <Link
                href="/create"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                상품 등록하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
} 