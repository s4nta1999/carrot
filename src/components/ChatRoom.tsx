'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatRoom as ChatRoomType, Message } from '@/types';

interface ChatRoomProps {
  chatRoom: ChatRoomType;
  onBack: () => void;
}

export default function ChatRoom({ chatRoom, onBack }: ChatRoomProps) {
  const { currentMessages, loading, sendMessage, fetchMessages } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅방 진입시 메시지 가져오기
  useEffect(() => {
    if (chatRoom.id) {
      fetchMessages(chatRoom.id);
    }
  }, [chatRoom.id]);

  // 새 메시지가 추가되면 스크롤을 맨 아래로
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    const messageToSend = message.trim();
    setMessage(''); // 입력창 즉시 클리어

    const { success, error } = await sendMessage(chatRoom.id, messageToSend);
    
    if (!success && error) {
      alert(error);
      setMessage(messageToSend); // 실패시 메시지 복원
    }
    
    setSending(false);
  };

  // 엔터키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // 상대방 정보 가져오기
  const getOtherUser = () => {
    if (!user) return null;
    
    if (chatRoom.buyer_id === user.id) {
      return chatRoom.seller_profile;
    } else {
      return chatRoom.buyer_profile;
    }
  };

  const otherUser = getOtherUser();

  // 메시지를 날짜별로 그룹화
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const dateKey = new Date(message.created_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([dateKey, messages]) => ({
      date: dateKey,
      messages
    }));
  };

  const messageGroups = groupMessagesByDate(currentMessages);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.username || '사용자'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {otherUser?.username?.[0] || '?'}
                </span>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">
                {otherUser?.username || '사용자'}
              </h3>
              <p className="text-sm text-gray-500">
                {chatRoom.products?.title}
              </p>
            </div>
          </div>
        </div>

        {/* 상품 가격 */}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {chatRoom.products?.price === 0 
              ? '나눔' 
              : `${chatRoom.products?.price?.toLocaleString()}원`
            }
          </p>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messageGroups.map(({ date, messages }) => (
              <div key={date}>
                {/* 날짜 구분선 */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(date)}
                  </div>
                </div>

                {/* 메시지들 */}
                <div className="space-y-2">
                  {messages.map((msg) => {
                    const isMyMessage = msg.sender_id === user?.id;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isMyMessage
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMyMessage ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {currentMessages.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-gray-500">
                  첫 메시지를 보내서 대화를 시작해보세요!
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className={`p-3 rounded-full transition-colors ${
              message.trim() && !sending
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 