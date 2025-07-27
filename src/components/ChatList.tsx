'use client';

import { useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatRoom } from '@/types';
import { getTimeAgo, formatPrice } from '@/lib/utils';

interface ChatListProps {
  onSelectChat: (chatRoom: ChatRoom) => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
  const { chatRooms, loading, error, fetchChatRooms } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user]);



  // 상대방 정보 가져오기
  const getOtherUser = (chatRoom: ChatRoom) => {
    if (!user) return null;
    
    if (chatRoom.buyer_id === user.id) {
      return chatRoom.seller_profile;
    } else {
      return chatRoom.buyer_profile;
    }
  };

  if (loading && chatRooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchChatRooms}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          아직 채팅이 없어요
        </h3>
        <p className="text-gray-500">
          관심 있는 상품에서 채팅을 시작해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {chatRooms.map((chatRoom) => {
        const otherUser = getOtherUser(chatRoom);
        const lastMessage = chatRoom.last_message;

        return (
          <div
            key={chatRoom.id}
            onClick={() => onSelectChat(chatRoom)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* 상품 이미지 */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={chatRoom.products?.image_url || '/images/placeholder.svg'}
                  alt={chatRoom.products?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 채팅 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {otherUser?.username || '사용자'}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {lastMessage && getTimeAgo(lastMessage.created_at)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 truncate mb-1">
                  {chatRoom.products?.title}
                </p>

                {lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage.sender_id === user?.id ? '나: ' : ''}
                    {lastMessage.content}
                  </p>
                )}
              </div>

              {/* 가격 및 읽지 않은 메시지 */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(chatRoom.products?.price || 0)}
                </p>
                
                {/* 읽지 않은 메시지 뱃지 (카카오톡 스타일) */}
                {lastMessage && 
                 lastMessage.sender_id !== user?.id && 
                 !lastMessage.is_read && (
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 