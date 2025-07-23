'use client';

import { useState } from 'react';
import ProductList from '@/components/ProductList';
import MobileLayout from '@/components/MobileLayout';
import { useProducts } from '@/contexts/ProductContext';

export default function ProductsPage() {
  const { products } = useProducts();
  
  // 검색 상태
  const [keyword, setKeyword] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // 필터링된 상품 리스트
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(keyword.toLowerCase()) ||
    product.description.toLowerCase().includes(keyword.toLowerCase())
  );

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
      <button className="p-2" aria-label="메뉴">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
      <div className="bg-gray-900">
        {/* 검색창 */}
        {isSearchVisible && (
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="상품명이나 설명을 검색해보세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg outline-none text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 상품 목록 */}
        <ProductList 
          products={filteredProducts}
          keyword={keyword}
          isSearchMode={isSearchVisible}
        />
        
        {/* 하단 여백 (플로팅 버튼과 겹치지 않도록) */}
        <div className="h-20"></div>
      </div>
    </MobileLayout>
  );
} 