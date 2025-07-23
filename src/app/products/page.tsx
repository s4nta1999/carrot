'use client';

import { useState } from 'react';
import ProductList from '@/components/ProductList';
import MobileLayout from '@/components/MobileLayout';
import { useProducts } from '@/contexts/ProductContext';
import { useUser } from '@/contexts/UserContext';

export default function ProductsPage() {
  const { products } = useProducts();
  const { logout } = useUser();
  
  // 검색 상태
  const [keyword, setKeyword] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
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

  // 필터링 및 정렬된 상품 리스트
  const getSortedProducts = () => {
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(keyword.toLowerCase()) ||
      product.description.toLowerCase().includes(keyword.toLowerCase())
    );

    // 정렬 적용
    switch (sortType) {
      case 'priceAsc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'popular':
        return filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'latest':
      default:
        return filtered.sort((a, b) => b.id - a.id); // ID가 높을수록 최신
    }
  };

  const sortedProducts = getSortedProducts();
  const currentSortOption = sortOptions.find(option => option.value === sortType);

  // 헤더 액션 버튼들
  const headerActions = (
    <>
      <button 
        onClick={() => setIsSearchVisible(!isSearchVisible)}
        className="p-2"
        aria-label="검색"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
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
        onClick={logout}
        className="p-2"
        aria-label="로그아웃"
        title="로그아웃"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
      <button className="relative p-2" aria-label="알림">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM21 12H3" />
        </svg>
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
      </button>
    </>
  );

  return (
    <MobileLayout 
      title="합정동 ▼"
      headerActions={headerActions}
    >
      {/* 검색바 */}
      {isSearchVisible && (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="상품명을 검색해보세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 현재 정렬 표시 및 결과 수 */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{currentSortOption?.icon}</span>
            <span>{currentSortOption?.label}</span>
            {keyword && (
              <>
                <span>•</span>
                <span>&apos;{keyword}&apos; 검색</span>
              </>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {sortedProducts.length}개 상품
          </span>
        </div>
      </div>

      {/* 상품 리스트 */}
      <ProductList 
        products={sortedProducts}
        keyword={keyword}
        isSearchMode={isSearchVisible && keyword.length > 0}
      />
    </MobileLayout>
  );
} 