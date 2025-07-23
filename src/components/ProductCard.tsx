import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex gap-3">
        {/* 상품 이미지 */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
            sizes="80px"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder.svg')) {
                target.src = '/images/placeholder.svg';
              }
            }}
          />
        </div>
        
        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">
            {product.title}
          </h3>
          
          {/* 위치와 시간 */}
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{product.location}</span>
            <span className="mx-1">•</span>
            <span>{product.timeAgo}</span>
          </div>
          
          {/* 가격 */}
          <div className="text-base font-bold text-white mb-2">
            {product.price === 0 ? '나눔' : `${product.price.toLocaleString()}원`}
          </div>
          
          {/* 상호작용 (좋아요, 댓글) */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {product.comments !== undefined && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{product.comments}</span>
              </div>
            )}
            {product.likes !== undefined && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{product.likes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 