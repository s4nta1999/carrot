import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useLikes(productId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const supabase = createClient();

  // 좋아요 상태 및 개수 가져오기
  const fetchLikeStatus = async () => {
    try {
      setLoading(true);

      // 좋아요 개수 가져오기
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (countError) {
        console.error('좋아요 개수 가져오기 오류:', countError);
      } else {
        setLikesCount(count || 0);
      }

      // 사용자의 좋아요 상태 확인
      if (user) {
        const { data, error: likeError } = await supabase
          .from('likes')
          .select('id')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .single();

        if (likeError && likeError.code !== 'PGRST116') {
          console.error('좋아요 상태 확인 오류:', likeError);
        } else {
          setIsLiked(!!data);
        }
      }
    } catch (error) {
      console.error('좋아요 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 좋아요 토글
  const toggleLike = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) {
          throw new Error(error.message);
        }

        setIsLiked(false);
        setLikesCount(prev => prev - 1);

        // 상품 테이블의 likes_count 업데이트
        await supabase
          .from('products')
          .update({ likes_count: likesCount - 1 })
          .eq('id', productId);

      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('likes')
          .insert([
            {
              product_id: productId,
              user_id: user.id
            }
          ]);

        if (error) {
          throw new Error(error.message);
        }

        setIsLiked(true);
        setLikesCount(prev => prev + 1);

        // 상품 테이블의 likes_count 업데이트
        await supabase
          .from('products')
          .update({ likes_count: likesCount + 1 })
          .eq('id', productId);
      }

      return { success: true };
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '좋아요 처리에 실패했습니다.' 
      };
    }
  };

  // 실시간 좋아요 구독
  useEffect(() => {
    if (!productId) return;

    fetchLikeStatus();

    // 실시간 좋아요 변경 구독
    const likesSubscription = supabase
      .channel(`likes:${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `product_id=eq.${productId}`
        },
        () => {
          // 좋아요 변경 시 다시 가져오기
          fetchLikeStatus();
        }
      )
      .subscribe();

    return () => {
      likesSubscription.unsubscribe();
    };
  }, [productId, user]);

  return {
    isLiked,
    likesCount,
    loading,
    toggleLike
  };
} 