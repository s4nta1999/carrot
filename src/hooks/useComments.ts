import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types';

export function useComments(productId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const supabase = createClient();

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            location,
            temperature
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('댓글 가져오기 오류:', error);
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error('댓글 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 추가
  const addComment = async (content: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    if (!content.trim()) {
      return { success: false, error: '댓글 내용을 입력해주세요.' };
    }

    try {
      setSubmitting(true);

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            product_id: productId,
            user_id: user.id,
            content: content.trim()
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

      if (error) {
        throw new Error(error.message);
      }

      // 로컬 상태 업데이트
      setComments(prev => [...prev, data]);

      return { success: true };
    } catch (error) {
      console.error('댓글 추가 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '댓글 추가에 실패했습니다.' 
      };
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 삭제
  const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // 본인 댓글만 삭제 가능

      if (error) {
        throw new Error(error.message);
      }

      // 로컬 상태 업데이트
      setComments(prev => prev.filter(comment => comment.id !== commentId));

      return { success: true };
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.' 
      };
    }
  };

  // 실시간 댓글 구독
  useEffect(() => {
    if (!productId) return;

    fetchComments();

    // 실시간 댓글 변경 구독
    const commentsSubscription = supabase
      .channel(`comments:${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `product_id=eq.${productId}`
        },
        async (payload) => {
          // 새 댓글이 다른 사용자에 의해 추가된 경우
          if (payload.new.user_id !== user?.id) {
            const { data } = await supabase
              .from('comments')
              .select(`
                *,
                profiles:user_id (
                  username,
                  avatar_url,
                  location,
                  temperature
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setComments(prev => [...prev, data]);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `product_id=eq.${productId}`
        },
        (payload) => {
          // 댓글이 다른 사용자에 의해 삭제된 경우
          if (payload.old.user_id !== user?.id) {
            setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [productId, user]);

  return {
    comments,
    loading,
    submitting,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
} 