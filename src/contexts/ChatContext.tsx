'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatRoom, Message, ChatContextType } from '@/types';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const supabase = createClient();

  // 채팅방 목록 가져오기
  const fetchChatRooms = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          products (
            id,
            title,
            price,
            image_url,
            status
          ),
          buyer_profile:buyer_id (
            username,
            avatar_url
          ),
          seller_profile:seller_id (
            username,
            avatar_url
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // 각 채팅방의 마지막 메시지 가져오기
      const roomsWithLastMessage = await Promise.all(
        (data || []).map(async (room) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              *,
              profiles:sender_id (
                username,
                avatar_url
              )
            `)
            .eq('chat_room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...room,
            last_message: lastMessage
          };
        })
      );

      setChatRooms(roomsWithLastMessage);
    } catch (err) {
      console.error('채팅방 가져오기 오류:', err);
      setError(err instanceof Error ? err.message : '채팅방을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 특정 채팅방의 메시지 가져오기
  const fetchMessages = async (chatRoomId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (
            username,
            avatar_url
          )
        `)
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setCurrentMessages(data || []);
    } catch (err) {
      console.error('메시지 가져오기 오류:', err);
      setError(err instanceof Error ? err.message : '메시지를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 채팅방 생성 또는 기존 채팅방 찾기
  const createChatRoom = async (productId: string): Promise<{ success: boolean; chatRoom?: ChatRoom; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      // 기존 채팅방이 있는지 확인
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          products (
            id,
            title,
            price,
            image_url,
            status,
            user_id
          ),
          buyer_profile:buyer_id (
            username,
            avatar_url
          ),
          seller_profile:seller_id (
            username,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .single();

      if (existingRoom) {
        return { success: true, chatRoom: existingRoom };
      }

      // 상품 정보 가져오기 (판매자 확인용)
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('user_id')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      // 본인 상품에는 채팅방 생성 불가
      if (product.user_id === user.id) {
        return { success: false, error: '본인 상품에는 채팅을 할 수 없습니다.' };
      }

      // 새 채팅방 생성
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert([
          {
            product_id: productId,
            buyer_id: user.id,
            seller_id: product.user_id
          }
        ])
        .select(`
          *,
          products (
            id,
            title,
            price,
            image_url,
            status
          ),
          buyer_profile:buyer_id (
            username,
            avatar_url
          ),
          seller_profile:seller_id (
            username,
            avatar_url
          )
        `)
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      // 로컬 상태 업데이트
      setChatRooms(prev => [newRoom, ...prev]);

      return { success: true, chatRoom: newRoom };
    } catch (err) {
      console.error('채팅방 생성 오류:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '채팅방 생성에 실패했습니다.' 
      };
    }
  };

  // 메시지 전송
  const sendMessage = async (chatRoomId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    try {
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert([
          {
            chat_room_id: chatRoomId,
            sender_id: user.id,
            content: content.trim()
          }
        ])
        .select(`
          *,
          profiles:sender_id (
            username,
            avatar_url
          )
        `)
        .single();

      if (sendError) {
        throw new Error(sendError.message);
      }

      // 로컬 메시지 상태 업데이트
      setCurrentMessages(prev => [...prev, data]);

      return { success: true };
    } catch (err) {
      console.error('메시지 전송 오류:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '메시지 전송에 실패했습니다.' 
      };
    }
  };

  // 메시지 읽음 표시
  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .neq('sender_id', user.id); // 본인이 보낸 메시지가 아닌 경우만

      // 로컬 상태 업데이트
      setCurrentMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      console.error('읽음 처리 오류:', err);
    }
  };

  // 실시간 메시지 및 채팅방 구독
  useEffect(() => {
    if (!user) return;

    // 새로운 메시지 구독
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('새 메시지 수신:', payload);
          
          // 현재 사용자가 참여한 채팅방의 메시지만 처리
          const { data: message } = await supabase
            .from('messages')
            .select(`
              *,
              profiles:sender_id (
                username,
                avatar_url
              ),
              chat_rooms!inner (
                buyer_id,
                seller_id
              )
            `)
            .eq('id', payload.new.id)
            .or(`chat_rooms.buyer_id.eq.${user.id},chat_rooms.seller_id.eq.${user.id}`)
            .single();

          if (message) {
            // 현재 메시지 목록 업데이트
            setCurrentMessages(prev => {
              const exists = prev.some(msg => msg.id === message.id);
              if (exists) return prev;
              return [...prev, message];
            });

            // 채팅방 목록도 업데이트 (마지막 메시지 갱신)
            setChatRooms(prev => {
              return prev.map(room => {
                if (room.id === message.chat_room_id) {
                  return { ...room, last_message: message };
                }
                return room;
              });
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms'
        },
        async (payload) => {
          console.log('새 채팅방 생성:', payload);
          // 새 채팅방이 생성되면 채팅방 목록 새로고침
          await fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user, fetchChatRooms]);

  // 읽지 않은 메시지 수 계산
  const getUnreadMessagesCount = (): number => {
    if (!user) return 0;
    
    // 각 채팅방별로 읽지 않은 메시지 수를 합계
    return chatRooms.reduce((total, room) => {
      // 마지막 메시지가 있고, 상대방이 보낸 메시지이며, 읽지 않은 경우
      if (room.last_message && 
          room.last_message.sender_id !== user.id && 
          !room.last_message.is_read) {
        return total + 1;
      }
      return total;
    }, 0);
  };

  const value = {
    chatRooms,
    currentMessages,
    loading,
    error,
    fetchChatRooms,
    fetchMessages,
    createChatRoom,
    sendMessage,
    markAsRead,
    getUnreadMessagesCount,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 