'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, ProductContextType, CreateProductData } from '@/types';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    id: 1,
    title: '파세코 창문형 인버터 에어컨',
    description: '상태 좋은 창문형 에어컨입니다. 올 여름에도 시원하게 사용했어요.',
    price: 340000,
    location: '망원제1동',
    timeAgo: '1시간 전',
    image: '/images/placeholder.svg',
    likes: 6,
    comments: 3
  },
  {
    id: 2,
    title: '캐리어 벽걸이 에어컨 (나눔)',
    description: '이사로 인해 나눔합니다. 직접 가져가실 분만 연락주세요.',
    price: 0,
    location: '양평동4가',
    timeAgo: '5분 전',
    image: '/images/placeholder.svg',
    likes: 2,
    comments: 1
  },
  {
    id: 3,
    title: 'M1 맥북 프로 급처',
    description: '급하게 처분합니다. 상태 좋아요.',
    price: 700000,
    location: '양평제2동',
    timeAgo: '4분 전',
    image: '/images/placeholder.svg',
    likes: 8,
    comments: 5
  },
  {
    id: 4,
    title: '샤오미 공기청정기 (나눔)',
    description: '한 번만 사용한 공기청정기 나눔합니다.',
    price: 0,
    location: '성산동',
    timeAgo: '6분 전',
    image: '/images/placeholder.svg',
    likes: 3,
    comments: 2
  },
  {
    id: 5,
    title: '아이폰 12 미니 128GB',
    description: '깨끗하게 사용했습니다. 박스, 충전기 모두 있어요.',
    price: 500000,
    location: '합정동',
    timeAgo: '10분 전',
    image: '/images/placeholder.svg',
    likes: 4,
    comments: 2
  },
  {
    id: 6,
    title: 'LG 스타일러 미러',
    description: '정말 깨끗합니다. 이사로 인한 급처분이에요.',
    price: 800000,
    location: '망원동',
    timeAgo: '15분 전',
    image: '/images/placeholder.svg',
    likes: 2,
    comments: 1
  }
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: CreateProductData) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
      location: '합정동', // 기본 위치
      timeAgo: '방금 전',
      likes: 0,
      comments: 0
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
} 