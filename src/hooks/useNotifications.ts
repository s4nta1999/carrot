import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'chat' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string; // 관련된 상품 ID, 채팅방 ID 등
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const supabase = createClient();

  // 알림 목록 가져오기
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 실제 좋아요 알림
      const { data: likes } = await supabase
        .from('likes')
        .select(`
          id,
          created_at,
          product_id,
          profiles:user_id (username),
          products:product_id (title, user_id)
        `)
        .neq('user_id', user.id) // 본인 좋아요 제외
        .eq('products.user_id', user.id) // 본인 상품에 대한 좋아요만
        .order('created_at', { ascending: false })
        .limit(10);

      // 실제 댓글 알림
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          product_id,
          profiles:user_id (username),
          products:product_id (title, user_id)
        `)
        .neq('user_id', user.id) // 본인 댓글 제외
        .eq('products.user_id', user.id) // 본인 상품에 대한 댓글만
        .order('created_at', { ascending: false })
        .limit(10);

      // 실제 채팅 알림 (새 채팅방)
      const { data: newChats } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          created_at,
          buyer_id,
          seller_id,
          products (title),
          buyer:buyer_id (username),
          seller:seller_id (username)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      // 알림 데이터 변환
      const likeNotifications: Notification[] = (likes || []).map((like: any) => ({
        id: `like-${like.id}`,
        type: 'like' as const,
        title: '❤️ 새로운 좋아요',
        message: `${like.profiles?.username || '누군가'}님이 "${like.products?.title}"을 좋아합니다.`,
        is_read: false,
        related_id: like.product_id,
        created_at: like.created_at
      }));

      const commentNotifications: Notification[] = (comments || []).map((comment: any) => ({
        id: `comment-${comment.id}`,
        type: 'comment' as const,
        title: '💬 새로운 댓글',
        message: `${comment.profiles?.username || '누군가'}님이 "${comment.products?.title}"에 댓글을 남겼습니다.`,
        is_read: false,
        related_id: comment.product_id,
        created_at: comment.created_at
      }));

      const chatNotifications: Notification[] = (newChats || []).map((chat: any) => {
        const otherUser = chat.buyer_id === user.id ? chat.seller : chat.buyer;
        return {
          id: `chat-${chat.id}`,
          type: 'chat' as const,
          title: '💬 새로운 채팅',
          message: `${otherUser?.username || '누군가'}님이 "${chat.products?.title}"에 대해 채팅을 시작했습니다.`,
          is_read: false,
          related_id: chat.id,
          created_at: chat.created_at
        };
      });

      // 모든 알림 합치고 시간순 정렬
      const allNotifications = [
        ...likeNotifications,
        ...commentNotifications,
        ...chatNotifications
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.is_read).length);

    } catch (error) {
      console.error('알림 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  // 시간 경과 계산
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

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // 좋아요 실시간 구독
    const likesSubscription = supabase
      .channel('notifications-likes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes'
        },
        () => {
          fetchNotifications(); // 새 좋아요가 있으면 알림 새로고침
        }
      )
      .subscribe();

    // 댓글 실시간 구독
    const commentsSubscription = supabase
      .channel('notifications-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        () => {
          fetchNotifications(); // 새 댓글이 있으면 알림 새로고침
        }
      )
      .subscribe();

    return () => {
      likesSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    getTimeAgo,
    refetch: fetchNotifications
  };
} 