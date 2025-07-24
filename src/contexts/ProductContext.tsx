'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductContextType, CreateProductData } from '@/types';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const supabase = createClient();

  // 시간 경과 계산 함수
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}일 전`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}달 전`;
  };

  // 상품 목록 가져오기
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            location,
            temperature
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setProducts(data || []);
    } catch (err) {
      console.error('상품 가져오기 오류:', err);
      setError(err instanceof Error ? err.message : '상품을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상품 추가
  const addProduct = async (productData: CreateProductData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            ...productData,
            user_id: user.id,
            image_url: productData.image_url || '/images/placeholder.svg',
            status: 'active'
          }
        ])
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            location,
            temperature
          )
        `)
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // 로컬 상태 업데이트
      setProducts(prev => [data, ...prev]);
      
      return { success: true };
    } catch (err) {
      console.error('상품 추가 오류:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '상품 등록에 실패했습니다.' 
      };
    }
  };

  // 상품 수정
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      const { data, error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // 본인 상품만 수정 가능
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            location,
            temperature
          )
        `)
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 로컬 상태 업데이트
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? data : product
        )
      );
      
      return { success: true };
    } catch (err) {
      console.error('상품 수정 오류:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '상품 수정에 실패했습니다.' 
      };
    }
  };

  // 상품 삭제
  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // 본인 상품만 삭제 가능

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // 로컬 상태 업데이트
      setProducts(prev => prev.filter(product => product.id !== id));
      
      return { success: true };
    } catch (err) {
      console.error('상품 삭제 오류:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '상품 삭제에 실패했습니다.' 
      };
    }
  };

  // 컴포넌트 마운트시 상품 목록 가져오기
  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>
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