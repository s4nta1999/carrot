'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProducts } from '@/contexts/ProductContext';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products } = useProducts();
  
  // ID로 상품 찾기
  const product = products.find(p => p.id === Number(id));
  
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(product?.likes || 0);
  
  // 댓글 상태
  const [comments, setComments] = useState([
    { id: 1, author: '김당근', content: '상태 어떤가요?', time: '5분 전' },
    { id: 2, author: '이사과', content: '네고 가능한가요?', time: '3분 전' }
  ]);

  // 댓글 추가/삭제 함수
  const addComment = (content: string) => {
    const newComment = {
      id: Date.now(),
      author: '나',
      content,
      time: '방금 전'
    };
    setComments(prev => [...prev, newComment]);
  };

  const removeComment = (commentId: number) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  // 좋아요 토글 함수
  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  if (!product) {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        <header className="bg-gray-900 border-b border-gray-700 flex-shrink-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => router.back()} className="p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium text-white mb-2">상품을 찾을 수 없습니다</h2>
            <Link href="/products" className="text-orange-500">목록으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  // 헤더 액션들
  const headerActions = (
    <>
      <button className="p-2">
        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
      <button className="p-2">
        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <button className="p-2">
        <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 헤더 - 고정 */}
      <header className="bg-gray-900 border-b border-gray-700 flex-shrink-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            {headerActions}
          </div>
        </div>
      </header>

      {/* 콘텐츠 영역 - 스크롤 가능 */}
      <main className="flex-1 overflow-y-auto">
        {/* 상품 이미지 */}
        <div className="relative w-full h-80 bg-gray-800">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder.svg')) {
                target.src = '/images/placeholder.svg';
              }
            }}
          />
        </div>

        {/* 상품 정보 */}
        <div className="p-4 bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-white">
              {product.price === 0 ? '나눔' : `${product.price.toLocaleString()}원`}
            </span>
            <button
              onClick={toggleLike}
              className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
            >
              <svg className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <h1 className="text-xl font-bold text-white mb-2">{product.title}</h1>
          
          <div className="flex items-center text-sm text-gray-400 mb-4">
            <span>합정동</span>
            <span className="mx-2">•</span>
            <span>5분 전</span>
            <span className="mx-2">•</span>
            <span>조회 {Math.floor(Math.random() * 100) + 50}</span>
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{comments.length}</span>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="border-t-8 border-gray-100">
          <CommentSection
            comments={comments}
            onAddComment={addComment}
            onRemoveComment={removeComment}
          />
        </div>

        {/* 하단 여백 */}
        <div className="h-20"></div>
      </main>

      {/* 하단 액션 버튼 - 고정 */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* 좋아요 버튼 */}
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              isLiked ? 'border-red-500 bg-red-500/20 text-red-500' : 'border-gray-600 bg-gray-800 text-gray-300'
            }`}
          >
            <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">❤️ {likes}</span>
          </button>

          {/* 채팅하기 버튼 */}
          <button 
            onClick={() => alert('채팅방으로 이동합니다')}
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium"
          >
            채팅하기
          </button>
        </div>
      </div>
    </div>
  );
} 