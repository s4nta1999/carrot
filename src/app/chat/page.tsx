'use client';

import { useState } from 'react';
import MobileLayout from '@/components/MobileLayout';
import ChatList from '@/components/ChatList';
import ChatRoom from '@/components/ChatRoom';
import { ChatRoom as ChatRoomType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoomType | null>(null);
  const { signOut } = useAuth();

  const handleSelectChat = (chatRoom: ChatRoomType) => {
    setSelectedChatRoom(chatRoom);
  };

  const handleBackToList = () => {
    setSelectedChatRoom(null);
  };

  // 채팅방이 선택된 경우 채팅방 컴포넌트 표시
  if (selectedChatRoom) {
    return (
      <div className="h-screen">
        <ChatRoom chatRoom={selectedChatRoom} onBack={handleBackToList} />
      </div>
    );
  }

  // 채팅 목록 표시
  const headerActions = (
    <>
      <button 
        onClick={signOut}
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
      title="채팅"
      headerActions={headerActions}
    >
      <ChatList onSelectChat={handleSelectChat} />
    </MobileLayout>
  );
} 