'use client';

import { useState, useEffect } from 'react';
import ProductList from '@/components/ProductList';
import MobileLayout from '@/components/MobileLayout';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const { products, fetchProducts } = useProducts();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  // 페이지 마운트시 상품 목록 새로고침 (사용자 위치 기반)
  useEffect(() => {
    if (profile?.location) {
      console.log('📍 사용자 위치 기반 상품 필터링:', profile.location);
      fetchProducts(profile.location);
    } else {
      console.log('📍 위치 정보 없음 - 전체 상품 표시');
      fetchProducts();
    }
  }, [profile?.location]);
  
  // 정렬 상태
  const [sortType, setSortType] = useState('latest'); // latest, priceAsc, priceDesc, popular
  const [isSortVisible, setIsSortVisible] = useState(false);

  // 정렬 옵션
  const sortOptions = [
    { value: 'latest', label: '최신순', icon: '🕒' },
    { value: 'priceAsc', label: '가격 낮은순', icon: '💰' },
    { value: 'priceDesc', label: '가격 높은순', icon: '💎' },
    { value: 'popular', label: '인기순', icon: '❤️' },
  ];

  // 정렬된 상품 리스트
  const getSortedProducts = () => {
    // 정렬 적용
    switch (sortType) {
      case 'priceAsc':
        return products.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return products.sort((a, b) => b.price - a.price);
      case 'popular':
        return products.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      case 'latest':
      default:
        return products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  const sortedProducts = getSortedProducts();
  const currentSortOption = sortOptions.find(option => option.value === sortType);

  // 헤더 액션 버튼들
  const headerActions = (
    <>
      {/* 정렬 버튼 */}
      <div className="relative">
        <button 
          onClick={() => setIsSortVisible(!isSortVisible)}
          className="p-2 flex items-center space-x-1"
          aria-label="정렬"
        >
          <span className="text-sm">{currentSortOption?.icon}</span>
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* 정렬 드롭다운 */}
        {isSortVisible && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortType(option.value);
                  setIsSortVisible(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                  sortType === option.value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
                {sortType === option.value && (
                  <svg className="w-4 h-4 ml-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <button 
        onClick={() => router.push('/notifications')}
        className="relative p-2" 
        aria-label="알림"
        title="알림"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM21 12H3" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </>
  );

  // 사용자 위치 기반 제목 생성
  const getLocationTitle = () => {
    if (profile?.location) {
      return `${profile.location}`;
    }
    return "전체 상품";
  };

  return (
    <MobileLayout 
      title={getLocationTitle()}
      headerActions={headerActions}
    >
      {/* 현재 정렬 표시 및 결과 수 */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{currentSortOption?.icon}</span>
            <span>{currentSortOption?.label}</span>
          </div>
          <span className="text-sm text-gray-500">
            {sortedProducts.length}개 상품
          </span>
        </div>
      </div>

      {/* 상품 리스트 */}
      <ProductList 
        products={sortedProducts}
      />
    </MobileLayout>
  );
} 