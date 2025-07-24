'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProducts } from '@/contexts/ProductContext';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLikes } from '@/hooks/useLikes';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products, loading } = useProducts();
  const { createChatRoom } = useChat();
  const { user } = useAuth();
  
  // ID로 상품 찾기 (UUID 문자열 비교)
  const product = products.find(p => p.id === id);
  
  const [chatLoading, setChatLoading] = useState(false);
  
  // 좋아요 기능 (실제 DB 연동)
  const { isLiked, likesCount, toggleLike } = useLikes(id as string);

  // 좋아요 토글 핸들러
  const handleToggleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const { success, error } = await toggleLike();
    if (!success && error) {
      alert(error);
    }
  };

  // 채팅하기 버튼 클릭
  const handleStartChat = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!product) {
      alert('상품 정보를 찾을 수 없습니다.');
      return;
    }

    setChatLoading(true);
    
    const { success, chatRoom, error } = await createChatRoom(product.id);
    
    if (success && chatRoom) {
      // 채팅 페이지로 이동하면서 채팅방 ID 전달
      router.push(`/chat?room=${chatRoom.id}`);
    } else {
      alert(error || '채팅방 생성에 실패했습니다.');
    }
    
    setChatLoading(false);
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

  // 로딩 중
  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // 상품을 찾을 수 없음
  if (!product) {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        <header className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <Link href="/products">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-white">상품 상세</h1>
            <div className="w-6"></div>
          </div>
        </header>
        
        <div className="flex items-center justify-center flex-1 text-center">
          <div>
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-xl font-bold text-white mb-2">상품을 찾을 수 없어요</h2>
            <p className="text-gray-400 mb-6">존재하지 않거나 삭제된 상품입니다.</p>
            <Link 
              href="/products"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              상품 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-900 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link href="/products">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">상품 상세</h1>
          <button className="p-1">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        {/* 상품 이미지 */}
        <div className="relative h-80 bg-gray-800">
          <Image
            src={product.image_url || '/images/placeholder.svg'}
            alt={product.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 상품 정보 */}
        <div className="p-4 bg-gray-900">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{product.title}</h2>
              <p className="text-2xl font-bold text-orange-500 mb-2">
                {product.price === 0 ? '나눔' : `${product.price.toLocaleString()}원`}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{product.location}</span>
                <span>•</span>
                <span>{getTimeAgo(product.created_at)}</span>
                <span>•</span>
                <span>조회 {product.views_count || 0}</span>
              </div>
            </div>
          </div>

          {/* 판매자 정보 */}
          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              {product.profiles?.avatar_url ? (
                <Image
                  src={product.profiles.avatar_url}
                  alt={product.profiles.username || '판매자'}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {product.profiles?.username?.[0] || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{product.profiles?.username || '사용자'}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{product.profiles?.location || '합정동'}</span>
                <span>•</span>
                <span>🌡️ {product.profiles?.temperature || 36.5}°C</span>
              </div>
            </div>
          </div>

          {/* 상품 설명 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">상품 정보</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {product.description || '상품 설명이 없습니다.'}
            </p>
          </div>

          {/* 댓글 섹션 */}
          <CommentSection productId={id as string} />
        </div>

        {/* 하단 여백 */}
        <div className="h-20"></div>
      </main>

      {/* 하단 액션 버튼 - 고정 */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* 좋아요 버튼 */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              isLiked ? 'border-red-500 bg-red-500/20 text-red-500' : 'border-gray-600 bg-gray-800 text-gray-300'
            }`}
          >
            <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">❤️ {likesCount}</span>
          </button>

          {/* 채팅하기 버튼 */}
          <button 
            onClick={handleStartChat}
            disabled={chatLoading || product.user_id === user?.id}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center ${
              product.user_id === user?.id
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : chatLoading
                ? 'bg-orange-400 text-white cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {chatLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                채팅방 생성 중...
              </>
            ) : product.user_id === user?.id ? (
              '내 상품입니다'
            ) : (
              '채팅하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 